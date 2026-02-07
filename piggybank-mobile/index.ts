import { registerRootComponent } from 'expo';

// TEMPORARY: Using test app to verify Expo connection
import App from './App-test';
// import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
