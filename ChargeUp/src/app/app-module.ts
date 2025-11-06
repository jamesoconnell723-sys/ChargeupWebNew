import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule, provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { RecaptchaModule } from 'ng-recaptcha';
import { Login } from './Login/login/login';
import { Recharge } from './player/recharge/recharge';
import { Redeem } from './player/redeem/redeem';
import { Wallet } from './player/wallet/wallet';
import { Giftcard } from './player/giftcard/giftcard';
import { PlayerLayout } from './player/player-layout/player-layout';
import { FormBuilder, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RecaptchaV3Module, RECAPTCHA_V3_SITE_KEY } from 'ng-recaptcha';
import { AddUser } from './Master/user/add-user/add-user';
import { Userlisting } from './Master/user/userlisting/userlisting';
import { AgentNavbar } from './Agent/agent-navbar/agent-navbar';
import { AgentUserManagement } from './Agent/agent-user-management/agent-user-management';
import { AgentRechargeRecords } from './Agent/agent-recharge-records/agent-recharge-records';
import { AgentRedeemRecords } from './Agent/agent-redeem-records/agent-redeem-records';
import { AgentSummary } from './Agent/agent-summary/agent-summary';
import { MasterNavbar } from './Master/master-navbar/master-navbar';
import { Passowrd } from './Login/passowrd/passowrd';
import { RechargeRecords } from './Master/recharge-records/recharge-records';
import { Summary } from './Master/summary/summary';
import { RedeemRecords } from './Master/redeem-records/redeem-records';
import { Edituser } from './Master/user/edituser/edituser';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FilterstatusPipe } from './Shared/filterstatus-pipe';
import { Signup } from './signup/signup';

@NgModule({
  declarations: [
    App,
    Login,
    Recharge,
    Redeem,
    Wallet,
    Giftcard,
    PlayerLayout,
       AddUser,
Userlisting,
AgentNavbar,
AgentUserManagement,
AgentRechargeRecords,
AgentRedeemRecords,
AgentSummary,
MasterNavbar,
Passowrd,
RechargeRecords,
Summary,
RedeemRecords,
Edituser,
FilterstatusPipe,
Signup

  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    RecaptchaV3Module,
    RecaptchaModule,
  CommonModule,
  FormsModule,
  MatButtonModule,
  MatIconModule,
  BrowserAnimationsModule
 ],
  
  
  providers: [],
  bootstrap: [App]
})
export class AppModule { }
