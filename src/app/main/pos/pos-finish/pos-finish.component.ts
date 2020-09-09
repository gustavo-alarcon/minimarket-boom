import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Ticket } from 'src/app/core/models/ticket.model';
import { AuthService } from 'src/app/core/services/auth.service';
import { tap } from 'rxjs/internal/operators/tap';
import { User } from 'src/app/core/models/user.model';
import { Observable } from 'rxjs/internal/Observable';

@Component({
  selector: 'app-pos-finish',
  templateUrl: './pos-finish.component.html',
  styleUrls: ['./pos-finish.component.scss']
})
export class PosFinishComponent implements OnInit {

  user$: Observable<User>;
  
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: Ticket,
    private dialogRef: MatDialogRef<PosFinishComponent>,
    public auth: AuthService
  ) { }

  ngOnInit(): void {
    this.user$ = this.auth.user$.pipe(
      tap(user => {
        console.log(user)
      })
    )
  }

  close(): void {
    this.dialogRef.close();
  }

}
