import { Component, OnDestroy, OnInit } from '@angular/core';
import { DataService } from '../../services/data.service';
import { Router } from '@angular/router';
import { slidingAnimation } from '../../animations/animation';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  animations: [slidingAnimation]
})
export class DashboardComponent implements OnInit, OnDestroy {

  employeeInfo: any;
  isSearch = false;
  filteredHistory:any;

  animVal = '';
currentPos = '';
duration = '';

isTableView = false;

  constructor(public router:Router, public dataService: DataService) {

  }

  ngOnInit(): void {
    this.employeeInfo = this.dataService.getEmployeeData();
    this.filteredHistory = this.employeeInfo.completedCourseList;
    //console.log(this.employeeInfo);
    this.animVal = 'in';
    this.currentPos = '0vw';
    this.duration = '0ms'

  }

  onLogoutClick=(eve:Event) => {
    this.dataService.isLoggedIn = false;
    this.router.navigate(['login']);
  }

  onSearchClick(elem: HTMLInputElement) {
    elem.focus();
  }

  onKeyChange(eve:Event) {
    //console.log((eve.target as HTMLInputElement).value);
    const searchString = ((eve.target as HTMLInputElement).value).toLowerCase();;
    this.filteredHistory = this.employeeInfo.completedCourseList.filter((item:any) => (item.coursename).toLowerCase().includes(searchString));

  }

  onArrowClick = (arrowStr: string) => {
    if(arrowStr == 'right') {
      /* if(this.currentPos = '-94vw') */
      switch (this.currentPos) {
        case '-94vw':
          this.currentPos = '-189vw';
          this.animVal = 'in';
          this.duration = '500ms';
          break;
          case '0vw':
            this.currentPos = '-94vw';
            this.animVal = 'in';
            this.duration = '500ms';
            break;
      }
    }

    if(arrowStr == 'left') {
      /* if(this.currentPos = '-94vw') */
      switch (this.currentPos) {
        case '-189vw':
          this.currentPos = '-94vw';
          this.animVal = 'in';
          this.duration = '500ms';
          break;
          case '-94vw':
            this.currentPos = '0vw';
            this.animVal = 'in';
            this.duration = '500ms';
            break;
      }
    }


  }

  onAnimDone = () => {
    this.animVal = '';
  }

  toggleView = () => {
    //console.log(this.isTableView);
    this.isTableView = !this.isTableView;
  }
  ngOnDestroy(): void {
    this.dataService.onDestroy();
  }

}
