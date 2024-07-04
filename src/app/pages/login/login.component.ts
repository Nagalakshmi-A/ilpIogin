import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { DataService } from '../../services/data.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  errorMsg = '';

  loginForm: FormGroup;
  invalidLogin = false;
  disbleButton = false;
  constructor(public router: Router, public dataService: DataService) {

  }

  ngOnInit(): void {
    this.dataService.isLoggedIn = false;
    this.loginForm = new FormGroup({
      empid : new FormControl('',[ Validators.minLength(3), Validators.required, Validators.pattern(/^GMM/i)]),
/*       pwd : new FormControl('', [Validators.required]) */
    })
  }
  onFormSubmit() {
    this.errorMsg = "Fetching details. This might take a few moments";
    this.invalidLogin = true;
    this.disbleButton = true;
    this.dataService.getJSON().subscribe((response: any) => {
      this.disbleButton = false;
      this.dataService.isDataLoaded = true;
      console.log(this.loginForm.value);
      const loginResult = this.dataService.setEmployeeData((this.loginForm.value['empid']).replace(/^GMM/i, ''));
      this.errorMsg = loginResult.status;
      if(loginResult.state == true) {
        this.dataService.isLoggedIn = true;
        this.router.navigate(['dashboard']);
      } else {
        this.showError();
      } 
    },
    (error:any) => {
      this.errorMsg = "Employee Database not available!";
      this.showError();
    });
  }

  showError() {
    this.invalidLogin = true;
    const timeout = setTimeout(() => {
      this.invalidLogin = false;
    }, 3000);
  }
}
