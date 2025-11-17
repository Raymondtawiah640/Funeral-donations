import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center">
          <h2 class="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            About Legacy Donation
          </h2>
          <p class="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
            Our mission is to provide support and comfort to families during their most difficult times.
          </p>
        </div>
        
        <div class="mt-16">
          <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <div>
              <h3 class="text-2xl font-bold text-gray-900">Our Mission</h3>
              <p class="mt-4 text-lg text-gray-500">
                Legacy Donation was founded with a simple yet powerful mission: to help families facing financial 
                hardship during their time of loss. We believe that no family should have to worry about the cost 
                of funeral arrangements when they should be focusing on healing and remembrance.
              </p>
              <p class="mt-4 text-lg text-gray-500">
                Through the generosity of our donors and the dedication of our volunteers, we provide financial 
                assistance, emotional support, and community resources to families in need.
              </p>
            </div>
            <div>
              <h3 class="text-2xl font-bold text-gray-900">How We Help</h3>
              <p class="mt-4 text-lg text-gray-500">
                We work directly with funeral homes, community organizations, and families to identify those who 
                need assistance. Our transparent process ensures that every donation goes directly to help a family 
                in their time of need.
              </p>
              <p class="mt-4 text-lg text-gray-500">
                Since our founding, we've helped hundreds of families and are committed to expanding our reach 
                to serve even more communities in need.
              </p>
            </div>
          </div>
        </div>
        
        <!-- Statistics -->
        <div class="mt-20">
          <h3 class="text-2xl font-bold text-gray-900 text-center">Our Impact</h3>
          <div class="mt-8 grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div class="text-center">
              <div class="text-4xl font-extrabold text-primary-600">500+</div>
              <div class="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Families Helped</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-extrabold text-primary-600">$2M+</div>
              <div class="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Donations Distributed</div>
            </div>
            <div class="text-center">
              <div class="text-4xl font-extrabold text-primary-600">50+</div>
              <div class="mt-2 text-sm font-medium text-gray-500 uppercase tracking-wide">Partner Organizations</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class AboutComponent {
  title = 'About - Legacy Donation';
}