import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
  <footer class="footer">
  <div class="footer-container">
    <div class="footer-section">
      <div class="flex items-center space-x-2">
            <div
              class="w-8 h-8 bg-white rounded-full flex items-center justify-center"
            >
              <span class="text-pink-600 font-bold text-lg">✦</span>
            </div>
            <h1 class="text-xl font-bold">Connect</h1>
          </div>
      
    </div>

    <div class="footer-section">
      <h4>Customers</h4>
      <ul>
        <li><a href="#">Buyer</a></li>
        <li><a href="#">Supplier</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>Company</h4>
      <ul>
        <li><a href="#">About us</a></li>
        <li><a href="#">Careers</a></li>
        <li><a href="#">Contact us</a></li>
      </ul>
    </div>

    <div class="footer-section">
      <h4>Further Information</h4>
      <ul>
        <li><a href="#">Terms & Conditions</a></li>
        <li><a href="#">Privacy Policy</a></li>
      </ul>
    </div>

    <div class="footer-section social">
      <h4>Follow us</h4>
      <div class="social-icons">
        <a href="#"><i class="fab fa-facebook-f"></i></a>
        <a href="#"><i class="fab fa-twitter"></i></a>
        <a href="#"><i class="fab fa-linkedin-in"></i></a>
        <a href="#"><i class="fab fa-medium-m"></i></a>
        <a href="#"><i class="fas fa-paper-plane"></i></a>
      </div>
    </div> 
    </div>
    <div class="footer-bottom">
    <p>© 2025 Diego-Nickol-Shillot-Naomi.</p>
  </div>
  
  
</footer>  
  `,
    styles:`
    .footer {
  background-color: #0b132b;
  color: #cfcfcf;
  padding: 60px 10%;
  font-family: 'Poppins', sans-serif;
}

.footer-container {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 40px;
}

.footer-section h3.logo {
  font-size: 22px;
  letter-spacing: 2px;
  color: #fff;
  margin-bottom: 10px;
}

.footer-section h4 {
  color: #fff;
  margin-bottom: 15px;
  font-size: 16px;
  font-weight: 600;
}

.footer-section ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer-section ul li {
  margin-bottom: 8px;
}

.footer-section ul li a {
  text-decoration: none;
  color: #cfcfcf;
  font-size: 14px;
  transition: color 0.3s ease;
}

.footer-section ul li a:hover {
  color: #5a70ff;
}

.social-icons {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.social-icons a {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background-color: #5a70ff;
  border-radius: 50%;
  color: #fff;
  font-size: 14px;
  transition: background 0.3s ease;
}

.social-icons a:hover {
  background-color: #3b4bdb;
}
  .footer-bottom {
  border-top: 1px solid #1f2745;
  margin-top: 40px;
  padding-top: 15px;
  text-align: center;
  font-size: 13px;
  color: #a0a0a0;
}

@media (max-width: 768px) {
  .footer-container {
    flex-direction: column;
    gap: 30px;
  }
}
  `,

})
export class FooterComponent {}