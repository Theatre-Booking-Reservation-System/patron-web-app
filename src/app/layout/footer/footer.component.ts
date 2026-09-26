import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  readonly year = new Date().getFullYear();
}
