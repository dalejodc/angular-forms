import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormArray, Validators } from '@angular/forms';
import { Observable } from 'rxjs';

import { PasswordValidator } from '../../validators/password.validator';
import { CountriesService } from '../../services/countries.service';

import swal from 'sweetalert2';

@Component({
	selector: 'app-data',
	templateUrl: './data.component.html',
	styleUrls: ['./data.component.css'],
	providers: [CountriesService]
})
export class DataComponent implements OnInit {

	countries: any;
	formExample: FormGroup;	
	formExampleNestedObj: FormGroup;	
	errorMessage: boolean = false;
	errorMessageSkill: boolean = false;
	successMessage: boolean = false;
	successMessageNestedForm: boolean = false;
	toast:any;
	checkedBox: boolean=false;
	skill:string;


	isCodeVisible:boolean = false;
	codeObjectMessage:string ="See the object."

	obj = `
	{
		fullname:{ 
			firstname: "First Name",
			lastname: "Last Name"
		},
		email: "email@example.com",
		skills: 
		[
		"Scrum",
		"MateriallizeCSS", 
		"Scrum", 
		"RUP", 
		"Angular"
		],
		password: "yoUrP4ss"
	}`;

	// Object to use in formExampleNestedObj
	user: Object = {
		fullname:{
			firstname: "First Name Example",
			lastname: "Last Name Example"
		},
		email: "email@example.com",
		skills: []
	}

	constructor(private _countryService:CountriesService) { 

		console.log(this.user);
		
		// First example of form of data approximation
		this.formExample = new FormGroup({
			'name': new FormControl('', 
				[
				Validators.required,
				Validators.minLength(5),
				Validators.pattern("[a-zA-Z\s]+")	
				]),
			'username': new FormControl('', 
				[
				Validators.required,
				Validators.minLength(3)
				]),
			'country':new FormControl('', Validators.required),
			'email': new FormControl('', 
				[
				Validators.required, 
				Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")
				]
				)
		});

		// Second example of form of data approximation
		this.formExampleNestedObj = new FormGroup({
			'fullname' : new FormGroup({
				'firstname': new FormControl('', 
					[
					Validators.required,
					Validators.pattern("[a-zA-Z\s]+")	
					]),
				'lastname': new FormControl('', 
					[
					Validators.required,
					Validators.pattern("[a-zA-Z\s]+"),
					this.noBatman	
					]),
			}),
			'email': new FormControl('', 
				[
					// sync
					Validators.required, 
					Validators.pattern("[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,3}$")
					],
					[
					// async
					this.emailTaken
					]
					),
			'skills': new FormArray([
				new FormControl('Scrum'),
				new FormControl('MaterializeCSS'),
				new FormControl('Semantic UI'),
				new FormControl('Angular')
				]),
			'password1': new FormControl('',
				[
				Validators.required, 
				PasswordValidator.strong, 
				Validators.minLength(5)
				]
				),
			'password2': new FormControl('', 
				[
				// this.noEqual();
				])
		});

		this.formExampleNestedObj.controls["password2"].setValidators([Validators.required, this.noEqual]);

		this.formExampleNestedObj.controls['fullname'].valueChanges
			.subscribe(data=>{
				console.log(data)
			});

	}

	// get formData() { return <FormArray>this.passwordForm.get('Data'); }
	
	ngOnInit() {
		this.getCountries();

		this.toast = swal.mixin({
			toast: true,
			position: 'top-end',
			showConfirmButton: false,
			timer: 3000
		});
	}

	/*
	emailTaken()
	This function check if the email is taken
	*/
	emailTaken(control:FormControl): Promise<any> | Observable<any>{


		let promise = new Promise(
			(resolve, reject)=>{
				setTimeout(()=>{
					if(control.value === "hello@angular.com"){
						// console.log("exists");
						resolve({exists:true})
					}else{
						resolve(null)
						// console.log("It doesn't exists");
					}
				}, 1000)
			}
			)

		return promise;
	}

	/*
	noEqual()
	This method is a custom validation form
	*/ 
	noEqual = (control:FormControl) => {
		if(control.value !== this.formExampleNestedObj.controls["password1"].value) {
			return {
				differentpass: true
			}
		}
		return null;
	}

	/*
	noBatman()
	This method is a custom validation form, don't let you type 'Batman' in the lastname input
	*/ 
	noBatman(control: FormControl):{[s:string]:boolean}{
		if(control.value==="Batman"){
			return{
				noBatman:true
			}
		}

		return null;
	}


	
	/*
	getCountries()
	This method get the countries of the simulated service to fill the select form
	*/ 
	getCountries(){
		this.countries = this._countryService.getCountries();
	}

	/*
	onCheckboxChange(event)
	This method check the event checked or unchecked of the checkbox to accept the terms
	*/
	onCheckboxChange(event) {
		if(event.target.checked) { 
			this.errorMessage = false;
			this.checkedBox = true;
		} else {
			this.checkedBox = false;
		}
	}

	/*
	save()
	This method simulates the submit of the form.
	*/
	save(){
		if(this.formExample.valid && this.checkedBox){
			this.successMessage = true;
			console.log(this.successMessage);
			this.toast({
				type: 'success',
				title: 'Must be sent!'
			})

			this.formExample.reset({
				user:{
					fullname:{
						firstname: null,
						lastname: null
					},
					email: null
				}
			})
		}else{
			if(!this.checkedBox){
				this.errorMessage = true;
			}
			this.toast({
				type: 'error',
				title: 'Error in the form!'
			})
		}
	}

	/*
	close()
	This method hide the success message of the simulated request
	*/ 
	close(){
		this.successMessage = false;
		this.successMessageNestedForm = false;
	}

	/*closeSkillMessage()
	This method hide the error message of skill input
	*/ 
	closeSkillMessage(){
		this.errorMessageSkill = false;
	}

	/*
	saveNestedForm()
	This method simulates the submit of the form of nested complex object.
	*/
	saveNestedForm(){

		if(this.formExampleNestedObj.valid){
			this.successMessageNestedForm = true;
			this.toast({
				type: 'success',
				title: 'Must be sent!'
			})

			this.formExampleNestedObj.reset();
		}else{
			this.toast({
				type: 'error',
				title: 'Error in the form!'
			})
		}
		console.log(this.formExampleNestedObj.value);
		console.log(this.formExampleNestedObj);
	}

	/* 
	addSkill()
	This method add a skill in the array of skills of type FormArray with the method push(). 
	*/
	addSkill(){
		// console.log(this.skill);
		if(this.skill){
			(<FormArray>this.formExampleNestedObj.controls['skills']).push(
				new FormControl(this.skill)
				);

			console.log('Skill added!');

			this.skill =null;
		}else{
			this.errorMessageSkill = true;
		}
	}

	/* 
	removeSkill(skill)
	This method compare de tag (x) to delete in the FormArray [skills]. It use removeAt(index) to delete
	a element from the array.
	*/
	removeSkill(x){

		for (var i = this.formExampleNestedObj.controls['skills'].value.length; i--;) {
			if (this.formExampleNestedObj.controls['skills'].value[i] == x) {
				
				console.log(x);
				
				
				// JS
				var element = document.getElementById(x);
				console.log(element);
				element.classList.toggle("zoomOut");
				
				setTimeout( () => {
					(<FormArray>this.formExampleNestedObj.controls['skills']).removeAt(i);
					console.log(this.formExampleNestedObj.controls['skills'].value);
				}, 1000);
				break;
			}
		}
	}

	displayCodeObject(){

		if(!this.isCodeVisible){
			this.codeObjectMessage = "Hide object"
			this.isCodeVisible = true;

		}else{
			var element = document.getElementById("code");
			console.log(element);
			element.classList.remove("fadeInRight");
			element.classList.toggle("fadeOutLeft");

			this.codeObjectMessage = "See object"
			
			setTimeout( () => {
				this.isCodeVisible = false;
			}, 600);
			
		}
	}
}
