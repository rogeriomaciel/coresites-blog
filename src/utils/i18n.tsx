import React, { createContext, useContext, useState, useEffect } from 'react'

export type Language = 'pt' | 'en'

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, variables?: Record<string, string>) => string
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    'nav.home': 'Home',
    'search.placeholder': 'Buscar artigos...',
    'search.results': 'Resultados para',
    'search.clear': 'Limpar busca',
    'search.empty': 'Nenhum artigo encontrado',
    'search.empty_sub': 'Tente buscar com outros termos.',
    'search.empty_none': 'Os artigos aparecerão aqui quando forem publicados.',
    'post.reading_time': 'min de leitura',
    'post.recent': 'Artigos Recentes',
    'post.related': 'Artigos Relacionados',
    'post.not_found': 'Artigo não encontrado.',
    'post.back_home': 'Voltar ao início',
    'category.all': 'Todos',
    'category.articles_count_singular': 'artigo nesta categoria',
    'category.articles_count_plural': 'artigos nesta categoria',
    'category.empty': 'Nenhum artigo nesta categoria',
    'category.empty_sub': 'Volte em breve, novos artigos estão a caminho!',
    'category.seo_title': 'Artigos',
    'category.seo_desc': 'Artigos sobre {name}. Conteúdo técnico e prático.',
    '404.title': '404',
    '404.message': 'Página não encontrada.',
    '404.button': 'Voltar ao início',
    'footer.rights': 'Todos os direitos reservados.',
  },
  en: {
    'nav.home': 'Home',
    'search.placeholder': 'Search articles...',
    'search.results': 'Results for',
    'search.clear': 'Clear search',
    'search.empty': 'No articles found',
    'search.empty_sub': 'Try searching for other terms.',
    'search.empty_none': 'Articles will appear here once published.',
    'post.reading_time': 'min read',
    'post.recent': 'Recent Articles',
    'post.related': 'Related Articles',
    'post.not_found': 'Article not found.',
    'post.back_home': 'Back to home',
    'category.all': 'All',
    'category.articles_count_singular': 'article in this category',
    'category.articles_count_plural': 'articles in this category',
    'category.empty': 'No articles in this category',
    'category.empty_sub': 'Check back soon, new articles are on the way!',
    'category.seo_title': 'Articles',
    'category.seo_desc': 'Articles about {name}. Technical and practical content.',
    '404.title': '404',
    '404.message': 'Page not found.',
    '404.button': 'Back to home',
    'footer.rights': 'All rights reserved.',
  }
}

const I18nContext = createContext<I18nContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Check URL query parameter first
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlLang = params.get('lang')
      if (urlLang === 'pt' || urlLang === 'en') {
        localStorage.setItem('blog_lang', urlLang)
        return urlLang
      }
    }

    const saved = localStorage.getItem('blog_lang')
    if (saved === 'pt' || saved === 'en') return saved
    
    // Auto-detect browser language
    const browserLang = navigator.language.toLowerCase()
    if (browserLang.startsWith('pt')) return 'pt'
    return 'en' // Default is English for other origins
  })

  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    localStorage.setItem('blog_lang', lang)
    // Update HTML lang attribute for accessibility/SEO
    document.documentElement.lang = lang
  };

  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  // Listen to URL search parameter changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const urlLang = params.get('lang')
      if ((urlLang === 'pt' || urlLang === 'en') && urlLang !== language) {
        setLanguageState(urlLang)
        localStorage.setItem('blog_lang', urlLang)
      }
    }
  }, [language])

  const t = (key: string, variables?: Record<string, string>): string => {
    const dict = translations[language]
    let text = dict[key] || translations['pt'][key] || key
    
    if (variables) {
      Object.entries(variables).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, v)
      })
    }
    return text
  }

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error('useI18n must be used within a LanguageProvider')
  }
  return context
}
