import { Component, HostListener, ViewChild, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { MaterialModule } from '../../../common/matrial/matrial.module';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { MatSidenav } from '@angular/material/sidenav';
import { FooterComponent } from '../footer/footer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MaterialModule, RouterOutlet, HttpClientModule, RouterLink, FooterComponent, CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements AfterViewInit {

  constructor(private cdref: ChangeDetectorRef,private router:Router) {
    
  }

  @ViewChild('drawer') drawer!: MatSidenav;
  isScreenSmall = false;
  isNamesVisible = true; 
  firstName:string;
  @HostListener('document:keydown.escape', ['$event'])
  onEscKeydown(event: KeyboardEvent) {
    console.log("this")
    if (this.drawer && this.drawer.close && event.key === 'Escape') {
      this.drawer.open();
    }
    
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isScreenSmall = event.target.innerWidth < 992;
    if(!this.isScreenSmall){
      this.drawer.opened=true
    }
    if(this.isScreenSmall){
      this.isNamesVisible=true
    }
    setTimeout(() => {
      this.setSidenavMode();
    }, 0);
    this.cdref.detectChanges();
  }

  ngAfterViewInit() {
    const userString = localStorage.getItem('user');
    if (userString) {
      const user = JSON.parse(userString);
      this.firstName = user.firstName;
    }
    if (typeof window !== "undefined") {
      this.isScreenSmall = window.innerWidth < 992;
      this.cdref.detectChanges();
      setTimeout(() => {
        this.setSidenavMode();
      }, 0);
    }
  }

  toggleNames() {
    this.isNamesVisible = !this.isNamesVisible;
  }

  setSidenavMode() {
    if (this.drawer) {
      this.drawer.mode = this.isScreenSmall ? 'push' : 'side';
    }
  }
  logOutUser(){
    localStorage.removeItem('user');
    this.router.navigate(['/'])
  }
}
