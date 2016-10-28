// (C) Copyright 2014-2015 Hewlett Packard Enterprise Development LP

import Ferret from './components/Ferret';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Status from './components/Status';
import SettingsEdit from './components/settings/SettingsEdit';
import Dashboard from './components/dashboard/Dashboard';
import Utilization from './components/Utilization';
import VirtualMachineIndex from
  './components/virtualMachine/VirtualMachineIndex';
import VirtualMachineAdd from './components/virtualMachine/VirtualMachineAdd';
import VirtualMachineEdit from './components/virtualMachine/VirtualMachineEdit';
import VirtualMachineShow from './components/virtualMachine/VirtualMachineShow';
import ActivityIndex from './components/activity/ActivityIndex';
import SizeIndex from './components/size/SizeIndex';
import SizeAdd from './components/size/SizeAdd';
import SizeEdit from './components/size/SizeEdit';
import ImageIndex from './components/image/ImageIndex';
import ImageAdd from './components/image/ImageAdd';
import ImageEdit from './components/image/ImageEdit';
import Software from './components/settings/Software';
// import TBD from 'grommet/components/TBD';

export let routes = [
  { path: '/', component: Ferret, indexRoute: { component: Status },
    childRoutes: [
      { path: 'login', component: Login },
      { path: 'reset-password', component: ResetPassword },
      { path: 'status', component: Status },
      { path: 'dashboard', component: Dashboard },
      { path: 'utilization', component: Utilization },
      { path: 'virtual-machines/add', component: VirtualMachineAdd },
      { path: 'virtual-machines/edit/*', component: VirtualMachineEdit },
      { path: 'virtual-machines/*', component: VirtualMachineShow },
      { path: 'virtual-machines', component: VirtualMachineIndex },
      { path: 'images/add', component: ImageAdd },
      { path: 'images/edit/*', component: ImageEdit },
      { path: 'images', component: ImageIndex },
      { path: 'virtual-machine-sizes/add', component: SizeAdd },
      { path: 'virtual-machine-sizes/edit/*', component: SizeEdit },
      { path: 'virtual-machine-sizes', component: SizeIndex },
      { path: 'activity', component: ActivityIndex },
      { path: 'settings/edit', component: SettingsEdit },
      { path: 'settings/software', component: Software },
      { path: 'settings/update', component: Software }
    ]
  }
];
