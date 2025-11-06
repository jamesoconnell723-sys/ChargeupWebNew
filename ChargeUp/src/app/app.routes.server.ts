import { ServerRoute, RenderMode } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
   { path: '', renderMode: RenderMode.Prerender },

  // ✅ All other routes (dynamic/user-based) render on client side
  { path: 'login', renderMode: RenderMode.Client },
  { path: 'password', renderMode: RenderMode.Client },
  { path: 'signup/:reflink', renderMode: RenderMode.Client },

  // Navbar subroutes
  { path: 'navbar', renderMode: RenderMode.Client },
  { path: 'navbar/userlisting', renderMode: RenderMode.Client },
  { path: 'navbar/edituser', renderMode: RenderMode.Client },
  { path: 'navbar/redeemrecords', renderMode: RenderMode.Client },
  { path: 'navbar/rechargerecords', renderMode: RenderMode.Client },
  { path: 'navbar/summary', renderMode: RenderMode.Client },

  // Player subroutes
  { path: 'player', renderMode: RenderMode.Client },
  { path: 'player/recharge', renderMode: RenderMode.Client },
  { path: 'player/redeem', renderMode: RenderMode.Client },
  { path: 'player/wallet', renderMode: RenderMode.Client },
  { path: 'player/giftcard', renderMode: RenderMode.Client },

  // Agent subroutes
  { path: 'agent', renderMode: RenderMode.Client },
  { path: 'agent/user-management', renderMode: RenderMode.Client },
  { path: 'agent/recharge-records', renderMode: RenderMode.Client },
  { path: 'agent/redeem-records', renderMode: RenderMode.Client },
  { path: 'agent/summary', renderMode: RenderMode.Client },
];