import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import Clarity from '@microsoft/clarity';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'Finance-Management';

  ngOnInit(): void{
    const projectId = "rya5c3o3nm";
    Clarity.init(projectId);
    console.log("Project Id : "+ projectId );
  }
}
