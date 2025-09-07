import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { LoginRequest } from '../../../interface/auth';
import { AuthService } from '../../../services/auth.service';
import { PermissionService } from '../../../services/permission.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  loading = false;
  hidePassword = true;
  returnUrl: string = '/';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private permissionService: PermissionService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    // Create login form with validators
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });

    // Get return URL from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  ngOnInit(): void {
    // If already logged in, redirect to appropriate default page
    if (this.authService.isLoggedIn()) {
      const defaultPage = this.permissionService.getDefaultPage();
      this.router.navigate([`/${defaultPage}`]);
    }
  }

  onSubmit(): void {
    // Stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;

    const loginRequest: LoginRequest = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password,
    };

    this.authService
      .login(loginRequest)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success('Login successful', 'Success');
            // Navigation is now handled by AuthService
          } else {
            this.toastr.error(response.message, 'Login Failed');
          }
        },
        error: err => {
          // Error will be handled by error interceptor
          console.error('Login error', err);
        },
      });
  }

  // Convenience getter for easy access to form fields
  get f() {
    return this.loginForm.controls;
  }
}
