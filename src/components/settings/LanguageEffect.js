import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { changePlatformLanguage } from '../../i18n';

export default function LanguageEffect() {
  const platformLanguage = useSelector(
    (state) => state.languageSettings.platformLanguage
  );

  useEffect(() => {
    changePlatformLanguage(platformLanguage);
  }, [platformLanguage]);

  return null;
}
