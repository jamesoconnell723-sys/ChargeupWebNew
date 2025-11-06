// import { Component, OnInit } from '@angular/core';
// import { ActivatedRoute, Router } from '@angular/router';
// import { PlayerService } from '../../services/player-service';

// @Component({
//   selector: 'app-paymentsuccess',
//   standalone: false,
//   templateUrl: './paymentsuccess.html',
//   styleUrl: './paymentsuccess.css'
// })
// export class Paymentsuccess implements OnInit {
//    transactionId: string | null = null;
//   paymentStatus: string = 'Processing...';
//   message: string = 'Verifying your payment, please wait ⏳...';

//   constructor(
//     private route: ActivatedRoute,
//     private router: Router,
//     private playerService: PlayerService
//   ) {}

//   ngOnInit(): void {
//     // ✅ 1. Get transaction info from Square redirect params
//     this.route.queryParams.subscribe((params) => {
//       this.transactionId = params['transactionId'] || null;
//     });

//     // ✅ 2. Optional: Verify payment status via backend (if you store payments)
//     if (this.transactionId) {
//       this.verifyPayment(this.transactionId);
//     } else {
//       // If Square doesn't send transactionId in query, just show success
//       this.paymentStatus = 'Success';
//       this.message = 'Payment completed successfully! 🎉';
//     }
//   }

//   verifyPayment(transactionId: string): void {
//     this.playerService.getPaymentStatus(transactionId).subscribe({
//       next: (res) => {
//         if (res.status === 'COMPLETED' || res.status === 'SUCCESS') {
//           this.paymentStatus = 'Success';
//           this.message = '✅ Payment completed successfully!';
//         } else if (res.status === 'PENDING') {
//           this.paymentStatus = 'Pending';
//           this.message = '⏳ Payment is pending. We’ll update your wallet soon.';
//         } else {
//           this.paymentStatus = 'Failed';
//           this.message = '❌ Payment failed. Please contact support.';
//         }
//       },
//       error: (err) => {
//         console.error('Payment verification error:', err);
//         this.paymentStatus = 'Unknown';
//         this.message = '⚠️ Could not verify payment status.';
//       }
//     });
//   }

//   goToHome(): void {
//     this.router.navigate(['/recharge']);
//   }

// }
