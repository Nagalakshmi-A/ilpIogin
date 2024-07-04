import { Component, OnInit } from '@angular/core';
import { DataService } from './services/data.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'ILP GMMCO';
  
  constructor(public dataService: DataService, public router: Router) {

  }

  ngOnInit(): void {    
    this.dataService.getCourseListJSON().subscribe((response:any) => {
      this.router.navigate(['login']);  
    });
  }
}
