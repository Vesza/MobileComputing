// registerRootComponent ist der Expo-Einstiegspunkt, der die App korrekt registriert.
// Dadurch funktioniert der Start sowohl in Expo Go als auch in einem nativen Build.
import { registerRootComponent } from 'expo';

// Importiert die eigentliche App-Komponente aus App.js.
import App from './App';

// App wird als Root-Komponente registriert.
// Expo kümmert sich dabei um die passende Initialisierung der Umgebung.
registerRootComponent(App);
