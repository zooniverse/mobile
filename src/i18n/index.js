import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
// Import language modules
import en from './locales/en';
import ar from './locales/ar';
import bn from './locales/bn';
import cs from './locales/cs';
import da from './locales/da';
import de from './locales/de';
import el from './locales/el';
import es from './locales/es';
import fi from './locales/fi';
import fr from './locales/fr';
import ha from './locales/ha';
import he from './locales/he';
import hi from './locales/hi';
import hr from './locales/hr';
import hu from './locales/hu';
import hy from './locales/hy';
import id from './locales/id';
import it from './locales/it';
import ja from './locales/ja';
import kn from './locales/kn';
import ko from './locales/ko';
import mr from './locales/mr';
import nl from './locales/nl';
import pl from './locales/pl';
import pt from './locales/pt';
import ru from './locales/ru';
import sw from './locales/sw';
import sv from './locales/sv';
import te from './locales/te';
import tr from './locales/tr';
import uk from './locales/uk';
import ur from './locales/ur';
import ve from './locales/ve';
import vi from './locales/vi';
import zhCn from './locales/zh-cn';
import zhTw from './locales/zh-tw';
import apiClient from 'panoptes-client/lib/api-client';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Keep track of current languages
let currentPlatformLanguage = 'en';
let currentProjectLanguage = 'en';
const projectListTranslationCache = {};
const projectListTranslationRequests = {};
const PROJECT_TRANSLATION_BATCH_SIZE = 100;

// Redux store is not initialized yet so grab the preferred language from async storage.
const getPreferredLanguageFromStorage = async () => {
  let preferredLanguage = 'en';
  try {
    const persistedStateJSON = await AsyncStorage.getItem('persist:root');

    if (persistedStateJSON) {
      const persistedState = JSON.parse(persistedStateJSON);
      const parsedState = {};
      Object.keys(persistedState).forEach((key) => {
        parsedState[key] = JSON.parse(persistedState[key]);
        if (key === 'languageSettings') {
          const parsed = JSON.parse(persistedState[key]);
          preferredLanguage = parsed?.platformLanguage ?? 'en';
        }
      });
    }
    return preferredLanguage;
  } catch (error) {
    return preferredLanguage;
  }
};

// Initialize i18n instance
const initializeI18n = async () => {
  try {
    const preferredLanguage = await getPreferredLanguageFromStorage();

    // Initialize i18n instance
    await i18next.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources: {
        en: {
          platform: en,
          project: {},
        },
        ar: {
          platform: ar,
          project: {},
        },
        bn: {
          platform: bn,
          project: {},
        },
        cs: {
          platform: cs,
          project: {},
        },
        da: {
          platform: da,
          project: {},
        },
        de: {
          platform: de,
          project: {},
        },
        el: {
          platform: el,
          project: {},
        },
        es: {
          platform: es,
          project: {},
        },
        fi: {
          platform: fi,
          project: {},
        },
        fr: {
          platform: fr,
          project: {},
        },
        ha: {
          platform: ha,
          project: {},
        },
        he: {
          platform: he,
          project: {},
        },
        hi: {
          platform: hi,
          project: {},
        },
        hr: {
          platform: hr,
          project: {},
        },
        hu: {
          platform: hu,
          project: {},
        },
        hy: {
          platform: hy,
          project: {},
        },
        id: {
          platform: id,
          project: {},
        },
        it: {
          platform: it,
          project: {},
        },
        ja: {
          platform: ja,
          project: {},
        },
        kn: {
          platform: kn,
          project: {},
        },
        ko: {
          platform: ko,
          project: {},
        },
        mr: {
          platform: mr,
          project: {},
        },
        nl: {
          platform: nl,
          project: {},
        },
        pl: {
          platform: pl,
          project: {},
        },
        pt: {
          platform: pt,
          project: {},
        },
        ru: {
          platform: ru,
          project: {},
        },
        sw: {
          platform: sw,
          project: {},
        },
        sv: {
          platform: sv,
          project: {},
        },
        te: {
          platform: te,
          project: {},
        },
        tr: {
          platform: tr,
          project: {},
        },
        uk: {
          platform: uk,
          project: {},
        },
        ur: {
          platform: ur,
          project: {},
        },
        ve: {
          platform: ve,
          project: {},
        },
        vi: {
          platform: vi,
          project: {},
        },
        zhcn: {
          platform: zhCn,
          project: {},
        },
        zhtw: {
          platform: zhTw,
          project: {},
        },
      },
      lng: preferredLanguage,
      fallbackLng: {
        platform: ['en'],
        project: ['en'],
        default: ['en'],
      },
      ns: ['platform', 'project'],
      defaultNS: 'platform',
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
      load: 'currentOnly',
    });

    currentPlatformLanguage = preferredLanguage;

    return i18next;
  } catch (error) {
    // Fall back to basic initialization with English
    await i18next.use(initReactI18next).init({
      compatibilityJSON: 'v3',
      resources: {
        en: {
          platform: en.default || en,
          project: {},
        },
      },
      lng: 'en',
      ns: ['platform', 'project'],
      defaultNS: 'platform',
      react: {
        useSuspense: false,
      },
    });
    return i18next;
  }
};

// Export the initialization promise
export const i18nInitialized = initializeI18n();

// Checks to see if the project translations includes the users preferred language.
export const getPreferredLanguageFromProject = (availableLanguages) => {
  const ret = availableLanguages.includes(currentPlatformLanguage)
    ? currentPlatformLanguage
    : 'en';

  return ret;
};

// Calls API to fetch translations and loads as resources.
export const loadProjectTranslations = async (
  language,
  project,
  workflow,
  guide = null,
  tutorial = null
) => {
  try {
    const translationTypes = [
      { type: 'project', id: project.id },
      { type: 'workflow', id: workflow.id },
      { type: 'tutorial', id: tutorial?.id },
      { type: 'field_guide', id: guide?.id },
    ].filter((item) => item.id); // Filter out null/undefined IDs

    const apiCalls = translationTypes.map(({ type, id }) =>
      apiClient.type('translations').get({
        language: language,
        translated_type: type,
        translated_id: id,
      })
    );

    const results = await Promise.all(apiCalls);
    const translations = {
      project: {},
      workflow: {},
      tutorial: {},
      fieldGuide: {},
      /*
      * To include platform translations in the project translations:
      * platform: i18next.getResourceBundle(language, 'platform') || {},
      * You might do this if projects that do not have the preferred language should only
      * be shown in one language. For example, the preferred language is Português and the project 
      * does not offer Português so it is displayed in English. Meanwhile, buttons like "Tutorial"
      * come from the platform translations in Português so the page would be a mix of English and Português.
      * If you wanted to ensure the entire page was English you would load the English platform
      * translations as part of the project to achieve this.
      */
    };

    // Process each translation group
    for (const translationGroup of results) {
      if (!Array.isArray(translationGroup)) continue;

      const { translated_type, strings } = translationGroup[0] || {};
      switch (translated_type) {
        case 'Project':
          translations.project = strings;
          break;
        case 'Workflow':
          translations.workflow = strings;
          break;
        case 'Tutorial':
          translations.tutorial = strings;
          break;
        case 'FieldGuide':
          translations.fieldGuide = strings;
          break;
      }
    }

    // Add translations to project namespace
    return changeProjectLanguage(language, translations);
  } catch (error) {
    console.warn('Error loading project translation resources:', error);
    throw error;
  }
};

// Updates preferred language
export const changePlatformLanguage = async (language) => {
  currentPlatformLanguage = language;

  // Change language for the whole instance
  await i18next.changeLanguage(language);

  return Promise.resolve();
};

// Function to change project language
const changeProjectLanguage = async (language, translations) => {

  if (translations) {
    // Get the platform translations for this language from the static files
    const platformTranslationsForLanguage = i18next.getResourceBundle(
      language,
      'platform'
    );

    // Create a complete translation bundle
    const completeTranslations = {
      ...translations,
      platform: platformTranslationsForLanguage || {},
    };

    // Add the complete translations to the project namespace
    // Use deep: false to replace the entire bundle instead of merging
    i18next.addResourceBundle(
      language,
      'project',
      completeTranslations,
      false,
      true
    );

    // Force i18next to re-emit to trigger component updates
    await i18next.changeLanguage(language);
  }

  currentProjectLanguage = language;

  return Promise.resolve();
};

export const getCurrentProjectLanguage = () => {
  return currentProjectLanguage ?? 'en';
}

// Clear project translations (useful when navigating between projects)
export const clearProjectTranslations = () => {
  const currentLang = i18next.language || 'en';

  // Remove the project namespace bundle
  i18next.removeResourceBundle(currentLang, 'project');

  // Re-add empty project namespace
  i18next.addResourceBundle(
    currentLang,
    'project',
    {},
    false,
    true
  );

  // Emit change event to update components
  i18next.emit('languageChanged', currentLang);
}

/**
 * Load translations for a mini-course resource into a dedicated `miniCourse`
 * i18next namespace. Intentionally NOT calling `loadProjectTranslations`
 * or sharing the `project` namespace — mini-course translations must stay
 * separate from tutorial translations.
 *
 * The API discriminator `translated_type` only knows about `tutorial` (the
 * underlying resource type), so that's what we send. The response shape is
 * the same as a tutorial's: `{ steps: [{ content }, ...], display_name }`.
 * It lands in `i18next` under namespace `miniCourse`, accessed as
 * `t('steps.${index}.content', { ns: 'miniCourse' })`.
 */
export const loadMiniCourseTranslations = async (language, miniCourse) => {
  if (!miniCourse?.id || !language) return;

  try {
    const result = await apiClient.type('translations').get({
      language,
      translated_type: 'tutorial',
      translated_id: miniCourse.id,
    });

    const { strings } = (Array.isArray(result) && result[0]) || {};
    const bundle = strings || {};

    i18next.addResourceBundle(language, 'miniCourse', bundle, false, true);
    i18next.emit('languageChanged', language);
  } catch (error) {
    console.warn('Error loading mini-course translations:', error);
    // Reset to empty so a stale bundle from a prior project doesn't leak.
    i18next.addResourceBundle(language, 'miniCourse', {}, false, true);
  }
};

/**
 * Clear mini-course translations. Mirrors `clearProjectTranslations` but
 * targets the `miniCourse` namespace only. Call when navigating between
 * projects/workflows.
 */
export const clearMiniCourseTranslations = () => {
  const currentLang = i18next.language || 'en';
  i18next.removeResourceBundle(currentLang, 'miniCourse');
  i18next.addResourceBundle(currentLang, 'miniCourse', {}, false, true);
  i18next.emit('languageChanged', currentLang);
};

export const loadProjectListTranslations = async (language, projectIds) => {
  const uniqueProjectIds = [...new Set(projectIds.map(String))];
  projectListTranslationCache[language] =
    projectListTranslationCache[language] || {};
  projectListTranslationRequests[language] =
    projectListTranslationRequests[language] || {};

  const cachedTranslations = projectListTranslationCache[language];
  const pendingRequests = projectListTranslationRequests[language];
  const missingProjectIds = uniqueProjectIds.filter(
    (id) =>
      !Object.prototype.hasOwnProperty.call(cachedTranslations, id) &&
      !pendingRequests[id]
  );

  try {
    if (missingProjectIds.length > 0) {
      const batches = [];
      for (
        let index = 0;
        index < missingProjectIds.length;
        index += PROJECT_TRANSLATION_BATCH_SIZE
      ) {
        batches.push(
          missingProjectIds.slice(index, index + PROJECT_TRANSLATION_BATCH_SIZE)
        );
      }

      const request = Promise.all(
        batches.map((batch) =>
          apiClient.type('translations').get({
            language,
            translated_type: 'project',
            translated_id: batch,
            page_size: batch.length,
          })
        )
      )
        .then((translationGroups) => {
          missingProjectIds.forEach((projectId) => {
            cachedTranslations[projectId] = {};
          });

          translationGroups.flat().forEach((translation) => {
            if (translation?.translated_id) {
              cachedTranslations[translation.translated_id] =
                translation.strings || {};
            }
          });
        })
        .finally(() => {
          missingProjectIds.forEach((projectId) => {
            delete pendingRequests[projectId];
          });
        });

      missingProjectIds.forEach((projectId) => {
        pendingRequests[projectId] = request;
      });
    }

    const requestsToAwait = [
      ...new Set(
        uniqueProjectIds
          .map((projectId) => pendingRequests[projectId])
          .filter(Boolean)
      ),
    ];

    await Promise.all(requestsToAwait);

    // Add to i18next resources
    i18next.addResourceBundle(
      language,
      'platform',
      {
        projectList: cachedTranslations,
      },
      true,
      true
    );

    return cachedTranslations;
  } catch (error) {
    console.warn('Error loading project list translations:', error);
    return null;
  }
};

export default i18next;
