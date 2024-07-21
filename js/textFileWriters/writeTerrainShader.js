function writeTerrainShader() {
let t = `
Includes = {
	"cw/pdxterrain.fxh"
	"cw/heightmap.fxh"
	"cw/shadow.fxh"
	"cw/utility.fxh"
	"cw/camera.fxh"
	"jomini/jomini_fog.fxh"
	"jomini/jomini_lighting.fxh"
	"jomini/jomini_fog_of_war.fxh"
	"jomini/jomini_water.fxh"
	"standardfuncsgfx.fxh"
	"bordercolor.fxh"
	"lowspec.fxh"
	"legend.fxh"
	"cw/lighting.fxh"
	"dynamic_masks.fxh"
	"disease.fxh"
}

VertexStruct VS_OUTPUT_PDX_TERRAIN
{
	float4 Position			: PDX_POSITION;
	float3 WorldSpacePos	: TEXCOORD1;
	float4 ShadowProj		: TEXCOORD2;
};

VertexStruct VS_OUTPUT_PDX_TERRAIN_LOW_SPEC
{
	float4 Position			: PDX_POSITION;
	float3 WorldSpacePos	: TEXCOORD1;
	float4 ShadowProj		: TEXCOORD2;
	float3 DetailDiffuse	: TEXCOORD3;
	float4 DetailMaterial	: TEXCOORD4;
	float3 ColorMap			: TEXCOORD5;		
	float3 FlatMap			: TEXCOORD6;
	float3 Normal			: TEXCOORD7;
};

# Limited JominiEnvironment data to get nicer transitions between the Flatmap lighting and Terrain lighting
# Only used in terrain shader while lerping between flatmap and terrain.
ConstantBuffer( FlatMapLerpEnvironment )
{
	float	FlatMapLerpCubemapIntensity;
	float3	FlatMapLerpSunDiffuse;
	float	FlatMapLerpSunIntensity;
	float4x4 FlatMapLerpCubemapYRotation;
};

VertexShader =
{
	TextureSampler DetailTextures
	{
		Ref = PdxTerrainTextures0
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Wrap"
		SampleModeV = "Wrap"
		type = "2darray"
	}
	TextureSampler NormalTextures
	{
		Ref = PdxTerrainTextures1
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Wrap"
		SampleModeV = "Wrap"
		type = "2darray"
	}
	TextureSampler MaterialTextures
	{
		Ref = PdxTerrainTextures2
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Wrap"
		SampleModeV = "Wrap"
		type = "2darray"
	}
	TextureSampler DetailIndexTexture
	{
		Ref = PdxTerrainTextures3
		MagFilter = "Point"
		MinFilter = "Point"
		MipFilter = "Point"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
	}
	TextureSampler DetailMaskTexture
	{
		Ref = PdxTerrainTextures4
		MagFilter = "Point"
		MinFilter = "Point"
		MipFilter = "Point"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
	}
	TextureSampler ColorTexture
	{
		Ref = PdxTerrainColorMap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
	}
	TextureSampler FlatMapTexture
	{
		Ref = TerrainFlatMap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
	}
	
	Code
	[[
		VS_OUTPUT_PDX_TERRAIN TerrainVertex( float2 WithinNodePos, float2 NodeOffset, float NodeScale, float2 LodDirection, float LodLerpFactor )
		{
			STerrainVertex Vertex = CalcTerrainVertex( WithinNodePos, NodeOffset, NodeScale, LodDirection, LodLerpFactor );

			#ifdef TERRAIN_FLAT_MAP_LERP
				Vertex.WorldSpacePos.y = lerp( Vertex.WorldSpacePos.y, FlatMapHeight, FlatMapLerp );
			#endif
			#ifdef TERRAIN_FLAT_MAP
				Vertex.WorldSpacePos.y = FlatMapHeight;
			#endif

			VS_OUTPUT_PDX_TERRAIN Out;
			Out.WorldSpacePos = Vertex.WorldSpacePos;

			Out.Position = FixProjectionAndMul( ViewProjectionMatrix, float4( Vertex.WorldSpacePos, 1.0 ) );
			Out.ShadowProj = mul( ShadowMapTextureMatrix, float4( Vertex.WorldSpacePos, 1.0 ) );

			return Out;
		}
		
		// Copies of the pixels shader CalcHeightBlendFactors and CalcDetailUV functions
		float4 CalcHeightBlendFactors( float4 MaterialHeights, float4 MaterialFactors, float BlendRange )
		{
			float4 Mat = MaterialHeights + MaterialFactors;
			float BlendStart = max( max( Mat.x, Mat.y ), max( Mat.z, Mat.w ) ) - BlendRange;
			
			float4 MatBlend = max( Mat - vec4( BlendStart ), vec4( 0.0 ) );
			
			float Epsilon = 0.00001;
			return float4( MatBlend ) / ( dot( MatBlend, vec4( 1.0 ) ) + Epsilon );
		}
		
		float2 CalcDetailUV( float2 WorldSpacePosXZ )
		{
			return WorldSpacePosXZ * DetailTileFactor;
		}
		
		// A low spec vertex buffer version of CalculateDetails
		void CalculateDetailsLowSpec( float2 WorldSpacePosXZ, out float3 DetailDiffuse, out float4 DetailMaterial )
		{
			float2 DetailCoordinates = WorldSpacePosXZ * WorldSpaceToDetail;
			float2 DetailCoordinatesScaled = DetailCoordinates * DetailTextureSize;
			float2 DetailCoordinatesScaledFloored = floor( DetailCoordinatesScaled );
			float2 DetailCoordinatesFrac = DetailCoordinatesScaled - DetailCoordinatesScaledFloored;
			DetailCoordinates = DetailCoordinatesScaledFloored * DetailTexelSize + DetailTexelSize * 0.5;
			
			float4 Factors = float4(
				(1.0 - DetailCoordinatesFrac.x) * (1.0 - DetailCoordinatesFrac.y),
				DetailCoordinatesFrac.x * (1.0 - DetailCoordinatesFrac.y),
				(1.0 - DetailCoordinatesFrac.x) * DetailCoordinatesFrac.y,
				DetailCoordinatesFrac.x * DetailCoordinatesFrac.y
			);
			
			float4 DetailIndex = PdxTex2DLod0( DetailIndexTexture, DetailCoordinates ) * 255.0;
			float4 DetailMask = PdxTex2DLod0( DetailMaskTexture, DetailCoordinates ) * Factors[0];
			
			float2 Offsets[3];
			Offsets[0] = float2( DetailTexelSize.x, 0.0 );
			Offsets[1] = float2( 0.0, DetailTexelSize.y );
			Offsets[2] = float2( DetailTexelSize.x, DetailTexelSize.y );
			
			for ( int k = 0; k < 3; ++k )
			{
				float2 DetailCoordinates2 = DetailCoordinates + Offsets[k];
				
				float4 DetailIndices = PdxTex2DLod0( DetailIndexTexture, DetailCoordinates2 ) * 255.0;
				float4 DetailMasks = PdxTex2DLod0( DetailMaskTexture, DetailCoordinates2 ) * Factors[k+1];
				
				for ( int i = 0; i < 4; ++i )
				{
					for ( int j = 0; j < 4; ++j )
					{
						if ( DetailIndex[j] == DetailIndices[i] )
						{
							DetailMask[j] += DetailMasks[i];
						}
					}
				}
			}

			float2 DetailUV = CalcDetailUV( WorldSpacePosXZ );
			
			float4 DiffuseTexture0 = PdxTex2DLod0( DetailTextures, float3( DetailUV, DetailIndex[0] ) ) * smoothstep( 0.0, 0.1, DetailMask[0] );
			float4 DiffuseTexture1 = PdxTex2DLod0( DetailTextures, float3( DetailUV, DetailIndex[1] ) ) * smoothstep( 0.0, 0.1, DetailMask[1] );
			float4 DiffuseTexture2 = PdxTex2DLod0( DetailTextures, float3( DetailUV, DetailIndex[2] ) ) * smoothstep( 0.0, 0.1, DetailMask[2] );
			float4 DiffuseTexture3 = PdxTex2DLod0( DetailTextures, float3( DetailUV, DetailIndex[3] ) ) * smoothstep( 0.0, 0.1, DetailMask[3] );
			
			float4 BlendFactors = CalcHeightBlendFactors( float4( DiffuseTexture0.a, DiffuseTexture1.a, DiffuseTexture2.a, DiffuseTexture3.a ), DetailMask, DetailBlendRange );
			//BlendFactors = DetailMask;
			
			DetailDiffuse = DiffuseTexture0.rgb * BlendFactors.x + 
							DiffuseTexture1.rgb * BlendFactors.y + 
							DiffuseTexture2.rgb * BlendFactors.z + 
							DiffuseTexture3.rgb * BlendFactors.w;
			
			DetailMaterial = vec4( 0.0 );
			
			for ( int i = 0; i < 4; ++i )
			{
				float BlendFactor = BlendFactors[i];
				if ( BlendFactor > 0.0 )
				{
					float3 ArrayUV = float3( DetailUV, DetailIndex[i] );
					float4 NormalTexture = PdxTex2DLod0( NormalTextures, ArrayUV );
					float4 MaterialTexture = PdxTex2DLod0( MaterialTextures, ArrayUV );

					DetailMaterial += MaterialTexture * BlendFactor;
				}
			}
		}
	
		VS_OUTPUT_PDX_TERRAIN_LOW_SPEC TerrainVertexLowSpec( float2 WithinNodePos, float2 NodeOffset, float NodeScale, float2 LodDirection, float LodLerpFactor )
		{
			STerrainVertex Vertex = CalcTerrainVertex( WithinNodePos, NodeOffset, NodeScale, LodDirection, LodLerpFactor );

			#ifdef TERRAIN_FLAT_MAP_LERP
				Vertex.WorldSpacePos.y = lerp( Vertex.WorldSpacePos.y, FlatMapHeight, FlatMapLerp );
			#endif
			#ifdef TERRAIN_FLAT_MAP
				Vertex.WorldSpacePos.y = FlatMapHeight;
			#endif

			VS_OUTPUT_PDX_TERRAIN_LOW_SPEC Out;
			Out.WorldSpacePos = Vertex.WorldSpacePos;

			Out.Position = FixProjectionAndMul( ViewProjectionMatrix, float4( Vertex.WorldSpacePos, 1.0 ) );
			Out.ShadowProj = mul( ShadowMapTextureMatrix, float4( Vertex.WorldSpacePos, 1.0 ) );
			
			CalculateDetailsLowSpec( Vertex.WorldSpacePos.xz, Out.DetailDiffuse, Out.DetailMaterial );
			
			float2 ColorMapCoords = Vertex.WorldSpacePos.xz * WorldSpaceToTerrain0To1;

#if defined( PDX_OSX ) && defined( PDX_OPENGL )
			// We're limited to the amount of samplers we can bind at any given time on Mac, so instead
			// we disable the usage of ColorTexture (since its effects are very subtle) and assign a
			// default value here instead.
			Out.ColorMap = float3( vec3( 0.5 ) );
#else
			Out.ColorMap = PdxTex2DLod0( ColorTexture, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).rgb;
#endif

			Out.FlatMap = float3( vec3( 0.5f ) ); // neutral overlay
			#ifdef TERRAIN_FLAT_MAP_LERP
				Out.FlatMap = lerp( Out.FlatMap, PdxTex2DLod0( FlatMapTexture, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).rgb, FlatMapLerp );
			#endif

			Out.Normal = CalculateNormal( Vertex.WorldSpacePos.xz );

			return Out;
		}
	]]
	
	MainCode VertexShader
	{
		Input = "VS_INPUT_PDX_TERRAIN"
		Output = "VS_OUTPUT_PDX_TERRAIN"
		Code
		[[
			PDX_MAIN
			{
				return TerrainVertex( Input.UV, Input.NodeOffset_Scale_Lerp.xy, Input.NodeOffset_Scale_Lerp.z, Input.LodDirection, Input.NodeOffset_Scale_Lerp.w );
			}
		]]
	}

	MainCode VertexShaderSkirt
	{
		Input = "VS_INPUT_PDX_TERRAIN_SKIRT"
		Output = "VS_OUTPUT_PDX_TERRAIN"
		Code
		[[
			PDX_MAIN
			{
				VS_OUTPUT_PDX_TERRAIN Out = TerrainVertex( Input.UV, Input.NodeOffset_Scale_Lerp.xy, Input.NodeOffset_Scale_Lerp.z, Input.LodDirection, Input.NodeOffset_Scale_Lerp.w );

				float3 Position = FixPositionForSkirt( Out.WorldSpacePos, Input.VertexID );
				Out.Position = FixProjectionAndMul( ViewProjectionMatrix, float4( Position, 1.0 ) );

				return Out;
			}
		]]
	}
	
	MainCode VertexShaderLowSpec
	{
		Input = "VS_INPUT_PDX_TERRAIN"
		Output = "VS_OUTPUT_PDX_TERRAIN_LOW_SPEC"
		Code
		[[
			PDX_MAIN
			{
				return TerrainVertexLowSpec( Input.UV, Input.NodeOffset_Scale_Lerp.xy, Input.NodeOffset_Scale_Lerp.z, Input.LodDirection, Input.NodeOffset_Scale_Lerp.w );
			}
		]]
	}

	MainCode VertexShaderLowSpecSkirt
	{
		Input = "VS_INPUT_PDX_TERRAIN_SKIRT"
		Output = "VS_OUTPUT_PDX_TERRAIN_LOW_SPEC"
		Code
		[[
			PDX_MAIN
			{
				VS_OUTPUT_PDX_TERRAIN_LOW_SPEC Out = TerrainVertexLowSpec( Input.UV, Input.NodeOffset_Scale_Lerp.xy, Input.NodeOffset_Scale_Lerp.z, Input.LodDirection, Input.NodeOffset_Scale_Lerp.w );

				float3 Position = FixPositionForSkirt( Out.WorldSpacePos, Input.VertexID );
				Out.Position = FixProjectionAndMul( ViewProjectionMatrix, float4( Position, 1.0 ) );

				return Out;
			}
		]]
	}
}


PixelShader =
{
	# PdxTerrain uses texture index 0 - 6

	# Jomini specific
	TextureSampler ShadowMap
	{
		Ref = PdxShadowmap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Wrap"
		SampleModeV = "Wrap"
		CompareFunction = less_equal
		SamplerType = "Compare"
	}

	# Game specific
	TextureSampler FogOfWarAlpha
	{
		Ref = JominiFogOfWar
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Wrap"
		SampleModeV = "Wrap"
	}
	TextureSampler FlatMapTexture
	{
		Ref = TerrainFlatMap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
	}
	TextureSampler EnvironmentMap
	{
		Ref = JominiEnvironmentMap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
		Type = "Cube"
	}
	TextureSampler FlatMapEnvironmentMap
	{
		Ref = FlatMapEnvironmentMap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
		Type = "Cube"
	}
	TextureSampler SurroundFlatMapMask
	{
		Ref = SurroundFlatMapMask
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Border"
		SampleModeV = "Border"
		Border_Color = { 1 1 1 1 }
		File = "gfx/map/surround_map/surround_mask.dds"
	}

	Code
	[[
		SLightingProperties GetFlatMapLerpSunLightingProperties( float3 WorldSpacePos, float ShadowTerm )
		{
			SLightingProperties LightingProps;
			LightingProps._ToCameraDir = normalize( CameraPosition - WorldSpacePos );
			LightingProps._ToLightDir = ToSunDir;
			LightingProps._LightIntensity = FlatMapLerpSunDiffuse * 5;
			LightingProps._ShadowTerm = ShadowTerm;
			LightingProps._CubemapIntensity = FlatMapLerpCubemapIntensity;
			LightingProps._CubemapYRotation = FlatMapLerpCubemapYRotation;

			return LightingProps;
		}
	]]

	MainCode PixelShader
	{
		Input = "VS_OUTPUT_PDX_TERRAIN"
		Output = "PDX_COLOR"
		Code
		[[
			PDX_MAIN
			{
				#ifdef TERRAIN_SKIRT
					return float4( 0, 0, 0, 0 );
				#endif

				clip( vec2(1.0) - Input.WorldSpacePos.xz * WorldSpaceToTerrain0To1 );

				float2 ColorMapCoords = Input.WorldSpacePos.xz * WorldSpaceToTerrain0To1;
				float3 FlatMap = PdxTex2D( FlatMapTexture, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).rgb;

				#ifdef TERRAIN_COLOR_OVERLAY
					float3 BorderColor;
					float BorderPreLightingBlend;
					float BorderPostLightingBlend;
					
					GetBorderColorAndBlendGameLerp( Input.WorldSpacePos.xz, FlatMap, BorderColor, BorderPreLightingBlend, BorderPostLightingBlend, 1.0f );
					
					FlatMap = lerp( FlatMap, BorderColor, saturate( BorderPreLightingBlend + BorderPostLightingBlend ) );
				#endif

				float3 FinalColor = FlatMap;
				#ifdef TERRAIN_FLATMAP_LIGHTING
					if ( HasFlatMapLightingEnabled == 1 )
					{
						float ShadowTerm = CalculateShadow( Input.ShadowProj, ShadowMap );
						SMaterialProperties FlatMapMaterialProps = GetMaterialProperties( FlatMap, float3( 0.0, 1.0, 0.0 ), 1.0, 0.0, 0.0 );
						SLightingProperties FlatMapLightingProps = GetSunLightingProperties( Input.WorldSpacePos, ShadowTerm );
						FinalColor = CalculateSunLighting( FlatMapMaterialProps, FlatMapLightingProps, EnvironmentMap );
					}
				#endif

				#ifdef TERRAIN_COLOR_OVERLAY
					ApplyHighlightColor( FinalColor, ColorMapCoords, 0.5 );
				#endif

				#ifdef TERRAIN_DEBUG
					TerrainDebug( FinalColor, Input.WorldSpacePos );
				#endif

				// Make flatmap transparent based on the SurroundFlatMapMask
				float SurroundMapAlpha = 1 - PdxTex2D( SurroundFlatMapMask, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).b;
				SurroundMapAlpha *= FlatMapLerp;

				return float4( FinalColor, SurroundMapAlpha );
			}
		]]
	}

	MainCode PixelShaderLowSpec
	{
		Input = "VS_OUTPUT_PDX_TERRAIN_LOW_SPEC"
		Output = "PDX_COLOR"
		Code
		[[
			PDX_MAIN
			{
				#ifdef TERRAIN_SKIRT
					return float4( 0, 0, 0, 0 );
				#endif

				clip( vec2(1.0) - Input.WorldSpacePos.xz * WorldSpaceToTerrain0To1 );

				float2 ColorMapCoords = Input.WorldSpacePos.xz * WorldSpaceToTerrain0To1;
				float3 FlatMap = PdxTex2D( FlatMapTexture, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).rgb;

				#ifdef TERRAIN_COLOR_OVERLAY
					float3 BorderColor;
					float BorderPreLightingBlend;
					float BorderPostLightingBlend;
					
					GetBorderColorAndBlendGameLerp( Input.WorldSpacePos.xz, FlatMap, BorderColor, BorderPreLightingBlend, BorderPostLightingBlend, 1.0f );
					
					FlatMap = lerp( FlatMap, BorderColor, saturate( BorderPreLightingBlend + BorderPostLightingBlend ) );
				#endif

				float3 FinalColor = FlatMap;
				#ifdef TERRAIN_FLATMAP_LIGHTING
					if ( HasFlatMapLightingEnabled == 1 )
					{
						float ShadowTerm = CalculateShadow( Input.ShadowProj, ShadowMap );
						SMaterialProperties FlatMapMaterialProps = GetMaterialProperties( FlatMap, float3( 0.0, 1.0, 0.0 ), 1.0, 0.0, 0.0 );
						SLightingProperties FlatMapLightingProps = GetSunLightingProperties( Input.WorldSpacePos, ShadowTerm );
						FinalColor = CalculateSunLighting( FlatMapMaterialProps, FlatMapLightingProps, EnvironmentMap );
					}
				#endif

				#ifdef TERRAIN_COLOR_OVERLAY
					ApplyHighlightColor( FinalColor, ColorMapCoords, 0.5 );
				#endif

				#ifdef TERRAIN_DEBUG
					TerrainDebug( FinalColor, Input.WorldSpacePos );
				#endif

				// Make flatmap transparent based on the SurroundFlatMapMask
				float SurroundMapAlpha = 1 - PdxTex2D( SurroundFlatMapMask, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).b;
				SurroundMapAlpha *= FlatMapLerp;

				return float4( FinalColor, SurroundMapAlpha );
			}
		]]
	}

	MainCode PixelShaderFlatMap
	{
		Input = "VS_OUTPUT_PDX_TERRAIN"
		Output = "PDX_COLOR"
		Code
		[[
			PDX_MAIN
			{
				#ifdef TERRAIN_SKIRT
					return float4( 0, 0, 0, 0 );
				#endif

				clip( vec2(1.0) - Input.WorldSpacePos.xz * WorldSpaceToTerrain0To1 );

				float2 ColorMapCoords = Input.WorldSpacePos.xz * WorldSpaceToTerrain0To1;
				float3 FlatMap = PdxTex2D( FlatMapTexture, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).rgb;

				#ifdef TERRAIN_COLOR_OVERLAY
					float3 BorderColor;
					float BorderPreLightingBlend;
					float BorderPostLightingBlend;
					
					GetBorderColorAndBlendGameLerp( Input.WorldSpacePos.xz, FlatMap, BorderColor, BorderPreLightingBlend, BorderPostLightingBlend, 1.0f );
					
					FlatMap = lerp( FlatMap, BorderColor, saturate( BorderPreLightingBlend + BorderPostLightingBlend ) );
				#endif

				float3 FinalColor = FlatMap;
				#ifdef TERRAIN_FLATMAP_LIGHTING
					if ( HasFlatMapLightingEnabled == 1 )
					{
						float ShadowTerm = CalculateShadow( Input.ShadowProj, ShadowMap );
						SMaterialProperties FlatMapMaterialProps = GetMaterialProperties( FlatMap, float3( 0.0, 1.0, 0.0 ), 1.0, 0.0, 0.0 );
						SLightingProperties FlatMapLightingProps = GetSunLightingProperties( Input.WorldSpacePos, ShadowTerm );
						FinalColor = CalculateSunLighting( FlatMapMaterialProps, FlatMapLightingProps, EnvironmentMap );
					}
				#endif

				#ifdef TERRAIN_COLOR_OVERLAY
					ApplyHighlightColor( FinalColor, ColorMapCoords, 0.5 );
				#endif

				#ifdef TERRAIN_DEBUG
					TerrainDebug( FinalColor, Input.WorldSpacePos );
				#endif

				// Make flatmap transparent based on the SurroundFlatMapMask
				float SurroundMapAlpha = 1 - PdxTex2D( SurroundFlatMapMask, float2( ColorMapCoords.x, 1.0 - ColorMapCoords.y ) ).b;
				SurroundMapAlpha *= FlatMapLerp;

				return float4( FinalColor, SurroundMapAlpha );
			}
		]]
	}
}


Effect PdxTerrain
{
	VertexShader = "VertexShader"
	PixelShader = "PixelShader"

	Defines = { "TERRAIN_FLAT_MAP_LERP" }
}

Effect PdxTerrainLowSpec
{
	VertexShader = "VertexShaderLowSpec"
	PixelShader = "PixelShaderLowSpec"
}

Effect PdxTerrainSkirt
{
	VertexShader = "VertexShaderSkirt"
	PixelShader = "PixelShader"
}

Effect PdxTerrainLowSpecSkirt
{
	VertexShader = "VertexShaderLowSpecSkirt"
	PixelShader = "PixelShaderLowSpec"
}

### FlatMap Effects

BlendState BlendStateAlpha
{
	BlendEnable = yes
	SourceBlend = "SRC_ALPHA"
	DestBlend = "INV_SRC_ALPHA"
}

Effect PdxTerrainFlat
{
	VertexShader = "VertexShader"
	PixelShader = "PixelShaderFlatMap"
	BlendState = BlendStateAlpha

	Defines = { "TERRAIN_FLAT_MAP" "TERRAIN_FLATMAP_LIGHTING" }
}

Effect PdxTerrainFlatSkirt
{
	VertexShader = "VertexShaderSkirt"
	PixelShader = "PixelShaderFlatMap"
	BlendState = BlendStateAlpha

	Defines = { "TERRAIN_FLAT_MAP" "TERRAIN_SKIRT" }
}

# Low Spec flat map the same as regular effect
Effect PdxTerrainFlatLowSpec
{
	VertexShader = "VertexShader"
	PixelShader = "PixelShaderFlatMap"
	BlendState = BlendStateAlpha

	Defines = { "TERRAIN_FLAT_MAP" }
}

Effect PdxTerrainFlatLowSpecSkirt
{
	VertexShader = "VertexShaderSkirt"
	PixelShader = "PixelShaderFlatMap"
	BlendState = BlendStateAlpha

	Defines = { "TERRAIN_FLAT_MAP" "TERRAIN_SKIRT" }
}

`
var data = new Blob([t], { type: 'text/plain' });
var url = window.URL.createObjectURL(data);
let link = `<a id="terrain-shader" download="pdxterrain.shader" href="">Download Terrain Shader</a><br>`;
document.getElementById("download-links").innerHTML += `${link}`;
document.getElementById(`terrain-shader`).href = url;
document.getElementById(`terrain-shader`).click();

}

function writeWaterShader() {
let t = `Includes = {
	"cw/heightmap.fxh"
	"bordercolor.fxh"
	"jomini/jomini_water_default.fxh"
	"jomini/jomini_water_pdxmesh.fxh"
	"jomini/jomini_water.fxh"
	"jomini/jomini_fog_of_war.fxh"
	"jomini/jomini_mapobject.fxh"
	"standardfuncsgfx.fxh"
}

PixelShader =
{
	TextureSampler FogOfWarAlpha
	{
		Ref = JominiFogOfWar
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Wrap"
		SampleModeV = "Wrap"
	}
	TextureSampler FlatMapTexture
	{
		Ref = TerrainFlatMap
		MagFilter = "Linear"
		MinFilter = "Linear"
		MipFilter = "Linear"
		SampleModeU = "Clamp"
		SampleModeV = "Clamp"
	}

	MainCode PixelShader
	{
		Input = "VS_OUTPUT_WATER"
		Output = "PDX_COLOR"
		Code
		[[
			PDX_MAIN
			{
				// MOD(flatmap-water)
				//float4 Water = CalcWater( Input )._Color;
				float4 Water = PdxTex2D( FlatMapTexture, Input.UV01 );

				float AccurateHeight   = GetHeight( Input.WorldSpacePos.xz );
				float WaterHeightDelta = _WaterHeight - AccurateHeight;
				Water.a = smoothstep(0.1f, 1.0f, WaterHeightDelta);
				// END MOD

				#ifdef WATER_COLOR_OVERLAY
					// Not enough texture slots, so use only secondary colors on water.
					#if defined( PDX_OSX ) && defined( PDX_OPENGL )
						ApplySecondaryColorGame( Water.rgb, float2( Input.UV01.x, 1.0f - Input.UV01.y ) );
					#else
						float3 BorderColor;
						float BorderPreLightingBlend;
						float BorderPostLightingBlend;
						GetProvinceOverlayAndBlend( Input.WorldSpacePos.xz, BorderColor, BorderPreLightingBlend, BorderPostLightingBlend );
						GetBorderColorAndBlendGame( Input.WorldSpacePos.xz, Water.rgb, BorderColor, BorderPreLightingBlend, BorderPostLightingBlend );

						// Don't draw too close to the shore to not duplicate the colors with stripes over the land.
						// MOD(flatmap-water)
						//float AccurateHeight = GetHeight( Input.WorldSpacePos.xz );
						// END MOD
						BorderPreLightingBlend *= 1.0f - Levels( max( AccurateHeight - ( _WaterHeight - 0.05f ), 0.0f ), 0.0f, 0.05f );

						Water.rgb = lerp( Water.rgb, BorderColor, BorderPreLightingBlend );
					#endif
				#endif
				
				Water.rgb = ApplyFogOfWarMultiSampled( Water.rgb, Input.WorldSpacePos, FogOfWarAlpha );
				Water.rgb = ApplyDistanceFog( Water.rgb, Input.WorldSpacePos );

				Water.rgb = FlatMapLerp > 0.0f ? lerp( Water.rgb, PdxTex2D( FlatMapTexture, Input.UV01 ).rgb, FlatMapLerp ) : Water.rgb;

				return Water;
			}
		]]
	}

	MainCode PixelShaderLowSpec
	{
		Input = "VS_OUTPUT_WATER"
		Output = "PDX_COLOR"
		Code
		[[			
			// low spec version of CalcWater
			float4 CalcWaterLowSpec( VS_OUTPUT_WATER Input, out float Depth )
			{
				float Height = GetHeightMultisample( Input.WorldSpacePos.xz, 0.65 );
				Depth = Input.WorldSpacePos.y - Height;
				
				float WaterFade = 1.0 - saturate( (_WaterFadeShoreMaskDepth - Depth) * _WaterFadeShoreMaskSharpness );
				float4 WaterColorAndSpec = PdxTex2D( WaterColorTexture, Input.UV01 );
				
				return float4(WaterColorAndSpec.xyz, WaterFade);
			}

			PDX_MAIN
			{
				float Depth;
				float4 Water = CalcWaterLowSpec( Input, Depth );

				#ifdef WATER_COLOR_OVERLAY
						ApplySecondaryColorGame( Water.rgb, float2( Input.UV01.x, 1.0f - Input.UV01.y ) );
				#endif
				
				Water.rgb = ApplyFogOfWarMultiSampled( Water.rgb, Input.WorldSpacePos, FogOfWarAlpha );
				Water.rgb = ApplyDistanceFog( Water.rgb, Input.WorldSpacePos );

				Water.rgb = FlatMapLerp > 0.0f ? lerp( Water.rgb, PdxTex2D( FlatMapTexture, Input.UV01 ).rgb, FlatMapLerp ) : Water.rgb;

				return Water;
			}
		]]
	}
}


Effect water
{
	VertexShader = "JominiWaterVertexShader"
	PixelShader = "PixelShader"
}

Effect waterLowSpec
{
	VertexShader = "JominiWaterVertexShader"
	PixelShader = "PixelShaderLowSpec"
}

Effect lake
{
	VertexShader = "VS_jomini_water_mesh"
	PixelShader = "PixelShader"
}
Effect lake_mapobject
{
	VertexShader = "VS_jomini_water_mapobject"
	PixelShader = "PixelShader"
}`    
var data = new Blob([t], { type: 'text/plain' });
var url = window.URL.createObjectURL(data);
let link = `<a id="water-shader" download="pdxwater.shader" href="">Download Water Shader</a><br>`;
document.getElementById("download-links").innerHTML += `${link}`;
document.getElementById(`water-shader`).href = url;
document.getElementById(`water-shader`).click();
}