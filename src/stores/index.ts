export const useIndexStore = defineStore('indexStore', () => {
  const isAuth = ref(false);

  const lang = useStorage<'en' | 'ru'>('lang', 'en');

  function setIsAuth(value: boolean) {
    isAuth.value = value;
  }

  function setLang(value: 'en' | 'ru') {
    lang.value = value;
  }

  return { isAuth, lang, setIsAuth, setLang };
});
