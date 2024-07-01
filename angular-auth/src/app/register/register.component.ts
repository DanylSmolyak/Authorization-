import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  errorMessage: string | null = null;
  passwordStrength: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      password: ['', Validators.required]
    });

    // Subscribe to password changes
    this.form.get('password')?.valueChanges.subscribe(value => {
      this.passwordStrength = this.calculatePasswordStrength(value);
    });
  }

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    const formData = this.form.getRawValue();
    console.log('Submitting form data:', formData);

    this.http.post('http://localhost:5184/api/Authorization/registration', formData)
      .subscribe({
        next: () => this.router.navigate(['/login']),
        error: (err) => {
          if (err.status === 409) {
            this.errorMessage = 'Username is already taken';
          } else if (err.status === 400) {
            const errorBody = err.error;
            if (errorBody && errorBody.message === 'Password should contain only letters A-Z') {
              this.errorMessage = 'Password should contain only letters A-Z';
            } else {
              this.errorMessage = 'Bad request. Please check your input.';
            }
          } else {
            this.errorMessage = 'An error occurred. Please try again.';
          }
        }
      });
  }


  calculatePasswordStrength(password: string): string {
    if (!password) {
      return 'empty';
    }
    if (password.length < 8) {
      return 'short';
    }

    const hasLetters = /[a-zA-Z]/.test(password);
    const hasDigits = /[0-9]/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (hasLetters && hasDigits && hasSymbols) {
      return 'strong';
    }
    if ((hasLetters && hasDigits) || (hasLetters && hasSymbols) || (hasDigits && hasSymbols)) {
      return 'medium';
    }
    return 'easy';
  }

  getPasswordStrengthClass(section: number): string {
    switch (this.passwordStrength) {
      case 'empty':
        return 'gray';
      case 'short':
        return 'red';
      case 'easy':
        return section === 1 ? 'red' : 'gray';
      case 'medium':
        return section === 1 ? 'yellow' : section === 2 ? 'yellow' : 'gray';
      case 'strong':
        return 'green';
      default:
        return 'gray';
    }
  }


  getPasswordStrengthText(): string {
    switch (this.passwordStrength) {
      case 'empty':
        return '';
      case 'short':
        return 'Password should be at least 8 characters long';
      case 'easy':
        return 'Weak password (only letters)';
      case 'medium':
        return 'Medium strength password';
      case 'strong':
        return 'Strong password';
      default:
        return '';
    }
  }
}
