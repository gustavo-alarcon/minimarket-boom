import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LogisticsComponent } from './logistics.component';


const routes: Routes = [
  {
    path: '',
    component: LogisticsComponent,
    children: [
      {
        path: '', 
        redirectTo: 'fabric', 
        pathMatch: 'full'
      },
      {
        path: 'fabric',
        loadChildren: () => import('./logistics-fabric/logistics-fabric.module').then(mod => mod.LogisticsFabricModule)
      },
      {
        path: 'returns',
        loadChildren: () => import('./logistics-returns/logistics-returns.module').then(mod => mod.LogisticsReturnsModule)
      },
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LogisticsRoutingModule { }
