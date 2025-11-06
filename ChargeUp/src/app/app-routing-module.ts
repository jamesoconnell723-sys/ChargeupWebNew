import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './Login/login/login';
import { Recharge } from './player/recharge/recharge';
import { Redeem } from './player/redeem/redeem';
import { Wallet } from './player/wallet/wallet';
import { Giftcard } from './player/giftcard/giftcard';
import { PlayerLayout } from './player/player-layout/player-layout';
import { AgentNavbar } from './Agent/agent-navbar/agent-navbar';
import { AgentUserManagement } from './Agent/agent-user-management/agent-user-management';
import { AgentRechargeRecords } from './Agent/agent-recharge-records/agent-recharge-records';
import { AgentRedeemRecords } from './Agent/agent-redeem-records/agent-redeem-records';
import { AgentSummary } from './Agent/agent-summary/agent-summary';
import { Userlisting } from './Master/user/userlisting/userlisting';
import { MasterNavbar } from './Master/master-navbar/master-navbar';
import { Passowrd } from './Login/passowrd/passowrd';
import { RechargeRecords } from './Master/recharge-records/recharge-records';
import { Summary } from './Master/summary/summary';
import { RedeemRecords } from './Master/redeem-records/redeem-records';
import { Edituser } from './Master/user/edituser/edituser';
import { Signup } from './signup/signup';


const routes: Routes = [
  { path: 'login', component: Login },
  { path: 'password', component: Passowrd },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  {
    path: 'navbar', component: MasterNavbar,
    children: [
      { path: 'userlisting', component: Userlisting },
      { path: 'edituser', component: Edituser },
      { path: 'redeemrecords', component: RedeemRecords },
      { path: 'rechargerecords', component: RechargeRecords },
      { path: 'summary', component: Summary },
      { path: '', redirectTo: 'userlisting', pathMatch: 'full' }
    ]
  },
  {
    path: 'player',
    component:PlayerLayout,
    children: [
      { path: 'recharge', component:Recharge },
      { path: 'redeem', component:Redeem },
      { path: 'wallet', component:Wallet },
      { path: 'giftcard', component: Giftcard },
      { path: '', redirectTo: 'recharge', pathMatch: 'full' }
    ]
  },


   {
    path: 'agent',
    component: AgentNavbar,
    children: [
      { path: 'user-management', component: AgentUserManagement },
      { path: 'recharge-records', component: AgentRechargeRecords },
      { path: 'redeem-records', component: AgentRedeemRecords },
      { path: 'summary', component: AgentSummary },
      { path: '', redirectTo: 'user-management', pathMatch: 'full' }
    ]
  },
  { path: 'signup/:reflink', component: Signup }

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
