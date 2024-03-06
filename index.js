document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.getElementById('nav-links');

    hamburger.addEventListener('click', function () {
      navLinks.classList.toggle('active');
    });
  });