import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { finalize } from 'rxjs';
import { UserEntity } from '../../../interface/user';
import { UserService } from '../../../services/user.service';

export interface UserDeleteDialogResult {
  action: 'deleted';
  user: UserEntity;
}

@Component({
  selector: 'app-user-delete-dialog',
  templateUrl: './user-delete-dialog.component.html',
  styleUrls: ['./user-delete-dialog.component.scss'],
})
export class UserDeleteDialogComponent implements OnInit {
  loading = false;

  constructor(
    private dialogRef: MatDialogRef<UserDeleteDialogComponent>,
    private userService: UserService,
    private toastr: ToastrService,
    @Inject(MAT_DIALOG_DATA) public data: { user: UserEntity }
  ) {}

  ngOnInit(): void {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onDelete(): void {
    this.loading = true;

    this.userService
      .deleteUser(this.data.user.m05Id)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: response => {
          if (response.isSuccess) {
            this.toastr.success(
              `User ${this.data.user.m05Name} has been deactivated successfully`,
              'User Deactivated'
            );
            this.dialogRef.close({
              action: 'deleted',
              user: this.data.user,
            });
          } else {
            this.toastr.error(response.message || 'Failed to deactivate user', 'Error');
          }
        },
        error: error => {
          console.error('User deactivation error:', error);
          this.toastr.error('Failed to deactivate user', 'Error');
        },
      });
  }
}
