import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { filter, map, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  isDataLoaded = false;
  isLoggedIn = false;
  empIdArray = [];
  dbDumpJSONArray: any;
  industryList: any;
  courseApplicability: any;
  courseListObject: any;
  loggedInEmployee: any;
  private employeeParsedData: any = {};
  private courseList: any = [];
  private months = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  private availableSBU = [
    'CIL',
    'EAST SBU',
    'ETB SBU',
    'NORTH SBU',
    'SOUTH SBU',
    'WEST SBU',
    'WORKSHOP',
  ];
  courseObject: any = {
    prefoundational: {
      SIPF: 'Service Industry Pre Foundational',
      EEPF: 'Electrical Pre Foundational',
      PTPF: 'Power Train Pre Foundational',
      HYDPF: 'Hydraulic Pre Foundational',
      DEPF: 'Diesel Engine Pre Foundational',
    },
    foundational: {
      SIF: 'Service Industry Foundational',
      DEF: 'Diesel Engine Foundational',
      EEF: 'Electrical Foundational',
      HYDF: 'Hydraulic Foundational',
      PTF: 'Power Train Foundational',
      BrakesF: 'Brakes Foundational',
      ACF: 'Aircondition Foundational',
      BAFAF: 'Basic AFA Foundational',
      HYDCRF: 'Hydraulic Component Repair Foundational',
      EP1F: 'Electric Power 1 Foundational',
    },
    advanced: {
      ADES: 'Advanced Diesel Engine Systems',
      AHS: 'Advanced Hydraulics System',
      APTS: 'Advanced Powertrain System',
      ABS: 'Advanced Brakes System',
      AACS: 'Advanced Airconditioning System',
      PTCR: 'Powertrain Component Repair',
      DER: 'Diesel Engine Rebuild (Old Engine Repair)',
      ETS: 'Electronics Troubleshooting',
      EMCP: 'EMCP 4.1/4.2 Controls',
      MCS: 'Marine Control Systems',
      ERB: 'Engine Rebuild (Gmmco WS)',
      AFA1: 'Applied Failure Analysis 1',
      AFA2: 'AFA II',
    } /*,
    "advancedcat": {
      "DETS": "Diesel Engine System Troubleshooting",
      "HSTS": "Hydraulic System Troubleshooting",
      "CREU": "Component Reuse",
      "PTTS": "Powertrain System Troubleshooting",
      "ACTS": "Airconditioning System Troubleshooting",
      "CARADV": "Advanced CAT Certified Machine Technician Skill Assessment",//xx
      "CEP2": "CAT Electric Power II",
      "CEP3": "CAT Electric Power III",
      "ATS": "Auto Transfer Switch & Switchgear Basics",
      "CEPADV": "Certified Electric Power Generation Hands-On Assessment",//xx
      "MEST": "Marine Engine System Troubleshooting",
      "PTRB": "Powertrain Components Rebuild",
      "HYDRB": "Hydraulic Component Rebuild"
    }*/,
  };

  constructor(public http: HttpClient) {}

  public getJSON(): Observable<any> {
    return this.http.get('./assets/json/datadump.json').pipe(
      tap((response: any) => {
        this.dbDumpJSONArray = [];
        this.dbDumpJSONArray = [...response];
        //console.log(this.dbDumpJSONArray);
        this.empIdArray = this.dbDumpJSONArray.map(
          (item: any) => item['Emp Id']
        );
        //console.log(this.empIdArray);
      })
    );
  }

  public getCourseListJSON(): Observable<any> {
    return this.http.get('./assets/json/course_applicability.json').pipe(
      tap((response: any) => {
        this.courseApplicability = response['Course Applicability'];
        this.industryList = response['Industry'].map(
          (item: any) => item['SBU_CAT_CLASSIFICATION']
        );
        //console.log(this.industryList);
        this.courseListObject = {};
        this.industryList.forEach((elem: any) => {
          this.courseListObject[elem] =  this.courseApplicability.filter(
            (item: any) => item[elem]
          )
          .map((iitem:any) => {
            const locItem = Object.assign({}, iitem);
            this.industryList.forEach((innerElem:any) => {
              if(elem == innerElem) {
                if(locItem[innerElem].includes('A')) {
                  locItem['Proficiency'] = 'Advanced';
                }
                if(locItem[innerElem].includes('F')) {
                  locItem['Proficiency'] = 'Foundational';
                }
              }
            })
            return locItem;
          })
          });
          console.log(this.courseListObject);     
      })
    );
  }

  public setEmployeeData(empid: string) {
    this.loggedInEmployee = this.dbDumpJSONArray.filter(
      (item: any) => item['Emp Id'] == empid
    )[0];
    console.log(this.loggedInEmployee);
    let errorStr = '';
    let state = false;
    if (this.loggedInEmployee == undefined) {
      errorStr = 'Please check the Employee ID!';
    } else if (this.isActiveEmployee() != '') {
      errorStr = 'Unauthorised User!';
    } else if (this.availableSBU.indexOf(this.loggedInEmployee['SBU']) == -1) {
      errorStr = 'Unauthorised User!';
    } else {
      errorStr = 'sucess';
      state = true;
    }
    return { state: state, status: errorStr };
  }

  isActiveEmployee(): string {
    //console.log(this.loggedInEmployee['RESIGNED (Date of Relieving)']);
    return this.loggedInEmployee['RESIGNED (Date of Relieving)'] ?? '';
  }

  getEmployeeData() {
    this.employeeParsedData = {};
    this.employeeParsedData.actualCurrentLevel = this.loggedInEmployee[
      'Current TCDP Certification Level'
    ]
      ? this.loggedInEmployee['Current TCDP Certification Level']
          .replace(/[^A-Z0-9]+/gi, '')
          .toLowerCase()
      : '';
    this.employeeParsedData.empname = this.loggedInEmployee['Name'];
    this.employeeParsedData.empid = this.loggedInEmployee['Emp Id'];
    this.employeeParsedData.location =
      this.loggedInEmployee["Location (Area) Apr'24"];
    this.employeeParsedData.reportingmanagername =
      this.loggedInEmployee["Reporting Officer - Name (Apr'24)"];
    this.employeeParsedData.industryType = this.getIndustryType(
      this.loggedInEmployee['SBU'],
      this.loggedInEmployee['CAT Industry Classification'],
      this.loggedInEmployee['TCDP Head Count']
    );
    this.employeeParsedData.courses = this.parseEmployeeCourse();
    this.employeeParsedData.currentLevel = this.getCurrentLevel();
    this.employeeParsedData.targetLevel = this.getTargetLevel();
    this.employeeParsedData.courseList = this.courseList;
    this.employeeParsedData.prefoundational =
      this.getCoursePercentage('prefoundational');
    this.employeeParsedData.foundational =
      this.getCoursePercentage('foundational');
    this.employeeParsedData.advanced = this.getCoursePercentage('advanced');
    this.employeeParsedData.advancedcat =
      this.getCoursePercentage('advancedcat');
    const checkStr =
      this.employeeParsedData.currentLevel == 'Not Certified'
        ? 'Pre - Foundational'
        : this.employeeParsedData.currentLevel;

    this.employeeParsedData.currentLevelPercent =
      this.employeeParsedData[
        checkStr.replace(/[^A-Z0-9]+/gi, '').toLowerCase()
      ];
    this.employeeParsedData.targetLevelPercent =
      this.employeeParsedData[
        this.employeeParsedData.targetLevel
          .replace(/[^A-Z0-9]+/gi, '')
          .toLowerCase()
      ];
    this.employeeParsedData.targetLevelpercent = this.getTargetLevel();

    this.employeeParsedData.completedCourseList = this.sortByDate(
      this.courseList.filter((item: any) => item.status == 'Completed')
    );
    this.employeeParsedData.notCompletedCourseList = this.courseList.filter(
      (item: any) => item.status == 'Not Completed'
    );
    this.getFinancialYearList();
    console.log(this.employeeParsedData);

    return this.employeeParsedData;
  }

  getCoursePercentage(courseType: string) {
    const courseList = this.courseList.filter(
      (item: any) => item.type == courseType
    );
    const completedCourse = courseList.filter(
      (item: any) => item.status == 'Completed'
    );
    return Math.floor((completedCourse.length / courseList.length) * 100);
  }

  getFinancialYearList() {
    const tempFin2023 = this.employeeParsedData.completedCourseList.filter(
      (item: any) => item.finYear == 2023
    );
    const tempFin2024 = this.employeeParsedData.completedCourseList.filter(
      (item: any) => item.finYear == 2024
    );
    const tempFin2025 = this.employeeParsedData.completedCourseList.filter(
      (item: any) => item.finYear == 2025
    );
    let temp2024LastIndex = 0;

    this.employeeParsedData.fin2023 =
      tempFin2023.length > 4 ? tempFin2023.slice(0, 4) : tempFin2023;

    //console.log(tempFin2024.length);
    if (tempFin2024.length > 4) {
      this.employeeParsedData.fin2024 = tempFin2024.slice(0, 4);
    } else if (tempFin2024.length < 4) {
      temp2024LastIndex = 4 - tempFin2024.length;
      const remaining2024 =
        this.employeeParsedData.notCompletedCourseList.slice(
          0,
          temp2024LastIndex
        );
      this.employeeParsedData.fin2024 = [...tempFin2024, ...remaining2024];
    } else {
      this.employeeParsedData.fin2024 = tempFin2024;
    }

    if (tempFin2025.length > 4) {
      this.employeeParsedData.fin2025 = tempFin2025.slice(0, 4);
    } else if (tempFin2025.length < 4) {
      const remainingCount = 4 - tempFin2025.length;
      const remaining2025 =
        this.employeeParsedData.notCompletedCourseList.slice(
          temp2024LastIndex,
          temp2024LastIndex + remainingCount
        );
      this.employeeParsedData.fin2025 = [...tempFin2025, ...remaining2025];
    } else {
      this.employeeParsedData.fin2025 = tempFin2025;
    }

    if (this.employeeParsedData.fin2023.length == 0) {
      this.employeeParsedData.fin2023.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2023.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2023.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2023.push({
        coursename: 'N/A',
        status: 'N/A',
      });
    }

    if (this.employeeParsedData.fin2024.length == 0) {
      this.employeeParsedData.fin2024.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2024.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2024.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2024.push({
        coursename: 'N/A',
        status: 'N/A',
      });
    }

    if (this.employeeParsedData.fin2025.length == 0) {
      this.employeeParsedData.fin2025.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2025.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2025.push({
        coursename: 'N/A',
        status: 'N/A',
      });
      this.employeeParsedData.fin2025.push({
        coursename: 'N/A',
        status: 'N/A',
      });
    }
  }

  sortByDate(courses: any) {
    return courses.sort((a: any, b: any) => {
      return b.date - a.date;
    });
  }

  getIndustryType(
    sbu: string,
    catIndustryClassification: string,
    tcdpHeadCount: string
  ) {
    //console.log(sbu, catIndustryClassification, tcdpHeadCount);
    let industryType = '';
    switch (sbu) {
      case 'ETB SBU':
        switch (catIndustryClassification) {
          case 'E&T - EPD':
          case 'E&T - PPD':
            industryType = 'ETB-EPD';
            break;
          case 'E&T - MPD':
            industryType = 'ETB-MPD';
            break;
          case 'E&T':
            if (tcdpHeadCount == 'TCDP') {
              industryType = 'ETB-EPD';
            }
            break;
        }
        break;
      case 'WORKSHOP':
        switch (catIndustryClassification) {
          case 'WS-MRC':
          case 'WS-CRC-ENG':
          case 'WS-CRC-HYD':
          case 'WS-CRC-PT':
            industryType = catIndustryClassification;
            break;
        }

        break;
      case 'South SBU':
      case 'North SBU':
      case 'East SBU':
      case 'West SBU':
      case 'CIL':
        industryType = sbu;
        break;
    }
    return industryType;
  }

  getCurrentLevel() {
    let currentStatus = 'Not Certified';    
    if (this.employeeParsedData.courses.prefoundational.status) {
      currentStatus = 'Pre - Foundational';
    }
    if (this.employeeParsedData.courses.foundational.status) {
      currentStatus = 'Foundational';
    }

    if (this.employeeParsedData.courses.advanced.status) {
      currentStatus = 'Advanced';
    }

    /*if(this.employeeParsedData.courses.advancedcat.status) {
      currentStatus = 'Advanced - CAT';
    }*/
    return currentStatus;
  }

  getTargetLevel() {
    let targetStatus = 'Pre - Foundational';
    if (this.employeeParsedData.courses.prefoundational.status) {
      targetStatus = 'Foundational';
    }
    if (this.employeeParsedData.courses.foundational.status) {
      targetStatus = 'Advanced';
    }

    if (this.employeeParsedData.courses.advanced.status) {
      targetStatus = 'Contact RM';
    }

    /*if(this.employeeParsedData.courses.advancedcat.status) {
      targetStatus = 'Contact RM';
    }*/
    return targetStatus;
  }

  parseEmployeeCourse() {
    const courses: any = {};
    this.courseList = [];
    courses.prefoundational = this.parseCourse('prefoundational', 6);
    courses.foundational = this.parseCourse('foundational', 3);
    courses.advanced = this.parseCourse('advanced', 5);
    //courses.advancedcat = this.parseCourse('advancedcat', 5);
    return courses;
  }

  parseCourse(courseType: string, numberOfAttempts: number) {
    const courseObject: any = {};
    const courses: any = [];
    //console.log('=======================');
    //console.log(this.courseObject);
    let employeeCourseList:any = undefined;
    let courseList:any;
    if(this.employeeParsedData.industryType != '') {
      employeeCourseList = this.courseListObject[this.employeeParsedData.industryType];
      courseList = employeeCourseList.filter((elem:any) => {
        return elem.Proficiency.replace(/[^A-Z0-9]+/gi, '').toLowerCase() == courseType;
      }).map((item:any) => item.CourseID)
    } else {
      courseList = Object.keys(this.courseObject[courseType]);
    }
    console.log('Employee Course List');
    
    console.log(courseList);
    courseList.forEach((elem:any) => {

      const courseItem: any = {};
      courseItem.courseID = elem;
      courseItem.courseDesc = this.courseObject[courseType][elem];
      const attempts = [];
      const attemptSearchStr =
        courseType == 'prefoundational'
          ? elem.split(/(?=.{2}$)/).join(' ')
          : courseType == 'foundational'
          ? elem.split(/(?=.{1}$)/).join(' ')
          : elem;
      for (let i = 1; i <= numberOfAttempts; i++) {
        const attempItem: any = {};
        attempItem.attemptnumber = i;
        //ABS Attempt 1 Date
        //ABS Attempt 2 Score
        attempItem.date = new Date(
          this.convertDateExcel(
            this.loggedInEmployee[
              attemptSearchStr + ' Attempt ' + i + ' Date'
            ] + 1
          )
        );
        attempItem.year = new Date(attempItem.date).getFullYear();
        attempItem.score =
          this.loggedInEmployee[attemptSearchStr + ' Attempt ' + i + ' Score'];
        attempts.push(attempItem);
      }
      const finalResultObj = attempts.filter(this.checkScore)[0];
      if (finalResultObj != undefined) {
        const courseAttemptObj: any = {};
        courseAttemptObj.coursename = courseItem.courseDesc;
        courseAttemptObj.date = finalResultObj.date;
        courseAttemptObj.year = finalResultObj.year;
        courseAttemptObj.finYear = this.getFinancialYear(courseAttemptObj.date);
        courseAttemptObj.score = finalResultObj.score;
        courseAttemptObj.status = 'Completed';
        courseAttemptObj.dispStatus = 'Completed';
        courseAttemptObj.type = courseType;
        courseItem.status = 'Completed';
        courseItem.dispStatus = 'Completed';
        this.courseList.push(courseAttemptObj);
        courseItem.finalScore = finalResultObj.score;
        courseItem.completedDate = finalResultObj.date;
        courseItem.numberOfAttempts = finalResultObj.attemptnumber;
      } else {
        const courseAttemptObj: any = {};
        courseAttemptObj.coursename = courseItem.courseDesc;
        courseAttemptObj.status = 'Not Completed';
        courseAttemptObj.dispStatus = 'Not Completed';
        courseItem.status = 'Not Completed';
        courseItem.dispStatus = 'Not Completed';
        if (
          this.employeeParsedData.actualCurrentLevel == courseType ||
          (this.employeeParsedData.actualCurrentLevel == 'foundational' &&
            courseType == 'prefoundational') ||
          (this.employeeParsedData.actualCurrentLevel == 'advanced' &&
            (courseType == 'prefoundational' || courseType == 'foundational')) ||
            (this.employeeParsedData.actualCurrentLevel == 'expert' &&
              (courseType == 'prefoundational' || courseType == 'foundational' || courseType == 'advanced'))
        ) {
          courseAttemptObj.status = 'Completed';
          courseItem.status = 'Completed';
        }

        /*if(this.employeeParsedData.actualCurrentLevel == 'foundational' && courseType == 'prefoundational') {

          }

          if(this.employeeParsedData.actualCurrentLevel == 'advanced' && (courseType == 'prefoundational' || courseType == 'foundational')) {

          }*/

        courseAttemptObj.type = courseType;
        this.courseList.push(courseAttemptObj);
      }
      courseItem.attempts = attempts;
      /* courseItem.status = 'Not Completed';
      if(courseItem.finalScore != '' && courseItem.finalScore != undefined) {
        if(parseInt(courseItem.finalScore, 2) >= 80) {
          courseItem.status = 'Completed';
        }
      } */
      courses.push(courseItem);
    });
    courseObject.courses = courses;
    //console.log('=========================sdfdsf');
    //console.log(courses);
    courseObject.status = courses.every(
      (elem: any) => elem.status == 'Completed'
    );
    courseObject.type = courseType;
    return courseObject;
  }

  checkScore(elem: any) {
    return elem.score >= 80;
  }

  convertDateExcel = (excelTimestamp: number) => {
    // 1. Subtract number of days between Jan 1, 1900 and Jan 1, 1970, plus 1 (Google "excel leap year bug")
    // 2. Convert to milliseconds.
    const secondsInDay = 24 * 60 * 60;
    const excelEpoch = new Date(1899, 11, 31);
    const excelEpochAsUnixTimestamp = excelEpoch.getTime();
    const missingLeapYearDay = secondsInDay * 1000;
    const delta = excelEpochAsUnixTimestamp - missingLeapYearDay;
    const excelTimestampAsUnixTimestamp = excelTimestamp * secondsInDay * 1000;
    const parsed = excelTimestampAsUnixTimestamp + delta;
    const date = isNaN(parsed) ? null : new Date(parsed);
    return date
      ? date.getUTCDate() +
          ' ' +
          this.months[date.getMonth()].substring(0, 3) +
          ' ' +
          date.getFullYear()
      : '';
  };

  getFinancialYear(dateStr: string): number {
    const date = new Date(dateStr);
    if (date.getMonth() < 3) {
      return date.getFullYear() - 1;
    } else {
      return date.getFullYear();
    }
  }
  onDestroy() {}
}
