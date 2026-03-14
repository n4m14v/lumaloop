import { GameScreen } from "../screens/GameScreen";
import { I18nProvider } from "../i18n/I18nProvider";

export function App() {
  return (
    <I18nProvider>
      <GameScreen />
    </I18nProvider>
  );
}
