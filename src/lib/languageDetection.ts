/**
 * Language detection and multi-language field mapping utilities
 */

export type SupportedLanguage = 'en' | 'uk' | 'ru' | 'pl'

export interface LanguageDetectionResult {
  language: SupportedLanguage
  confidence: number
  alternativeLanguages?: Array<{
    language: SupportedLanguage
    confidence: number
  }>
}

export interface LanguageFieldMappings {
  [language: string]: {
    [field: string]: string[]
  }
}

export class LanguageDetection {
  private static languageKeywords: { [key in SupportedLanguage]: string[] } = {
    en: [
      'project', 'client', 'customer', 'budget', 'timeline', 'deadline',
      'description', 'deliverables', 'requirements', 'scope', 'features',
      'company', 'organization', 'contact', 'email', 'phone', 'address',
      'proposal', 'estimate', 'quote', 'price', 'cost', 'development',
      'design', 'website', 'application', 'software', 'service'
    ],
    uk: [
      'проект', 'клієнт', 'замовник', 'бюджет', 'термін', 'дедлайн',
      'опис', 'завдання', 'вимоги', 'обсяг', 'функції', 'можливості',
      'компанія', 'організація', 'контакт', 'електронна', 'пошта', 'телефон',
      'пропозиція', 'оцінка', 'ціна', 'вартість', 'розробка',
      'дизайн', 'веб-сайт', 'додаток', 'програма', 'послуга'
    ],
    ru: [
      'проект', 'клиент', 'заказчик', 'бюджет', 'срок', 'дедлайн',
      'описание', 'задачи', 'требования', 'объем', 'функции', 'возможности',
      'компания', 'организация', 'контакт', 'электронная', 'почта', 'телефон',
      'предложение', 'оценка', 'цена', 'стоимость', 'разработка',
      'дизайн', 'веб-сайт', 'приложение', 'программа', 'услуга'
    ],
    pl: [
      'projekt', 'klient', 'zamawiający', 'budżet', 'termin', 'deadline',
      'opis', 'zadania', 'wymagania', 'zakres', 'funkcje', 'możliwości',
      'firma', 'organizacja', 'kontakt', 'email', 'telefon', 'adres',
      'propozycja', 'wycena', 'cena', 'koszt', 'rozwój',
      'design', 'strona', 'aplikacja', 'oprogramowanie', 'usługa'
    ]
  }

  private static fieldMappings: LanguageFieldMappings = {
    en: {
      title: ['project', 'name', 'title', 'subject', 'deal', 'opportunity'],
      clientName: ['client', 'customer', 'contact', 'lead', 'person', 'name'],
      clientEmail: ['email', 'contact email', 'client email', 'person email', 'e-mail'],
      clientCompany: ['company', 'organization', 'business', 'org', 'firm', 'corp'],
      description: ['description', 'notes', 'details', 'summary', 'overview', 'info'],
      estimatedBudget: ['budget', 'price', 'cost', 'value', 'amount', 'fee', 'rate'],
      timeline: ['timeline', 'duration', 'deadline', 'due date', 'timeframe', 'schedule'],
      deliverables: ['deliverables', 'scope', 'features', 'requirements', 'tasks', 'goals'],
      industry: ['industry', 'sector', 'category', 'type', 'vertical', 'field'],
      priority: ['priority', 'importance', 'urgency', 'level'],
      status: ['status', 'stage', 'phase', 'state', 'progress']
    },
    uk: {
      title: ['проект', 'назва', 'заголовок', 'тема', 'угода'],
      clientName: ['клієнт', 'замовник', 'контакт', 'особа', 'імя'],
      clientEmail: ['електронна пошта', 'емейл', 'пошта', 'електронка'],
      clientCompany: ['компанія', 'організація', 'фірма', 'підприємство'],
      description: ['опис', 'нотатки', 'деталі', 'резюме', 'інформація'],
      estimatedBudget: ['бюджет', 'ціна', 'вартість', 'сума', 'тариф'],
      timeline: ['термін', 'тривалість', 'дедлайн', 'розклад', 'часові рамки'],
      deliverables: ['завдання', 'обсяг', 'функції', 'вимоги', 'цілі'],
      industry: ['галузь', 'сектор', 'категорія', 'тип', 'сфера'],
      priority: ['пріоритет', 'важливість', 'терміновість', 'рівень'],
      status: ['статус', 'етап', 'фаза', 'стан', 'прогрес']
    },
    ru: {
      title: ['проект', 'название', 'заголовок', 'тема', 'сделка'],
      clientName: ['клиент', 'заказчик', 'контакт', 'лицо', 'имя'],
      clientEmail: ['электронная почта', 'емейл', 'почта', 'электронка'],
      clientCompany: ['компания', 'организация', 'фирма', 'предприятие'],
      description: ['описание', 'заметки', 'детали', 'резюме', 'информация'],
      estimatedBudget: ['бюджет', 'цена', 'стоимость', 'сумма', 'тариф'],
      timeline: ['срок', 'длительность', 'дедлайн', 'расписание', 'временные рамки'],
      deliverables: ['задачи', 'объем', 'функции', 'требования', 'цели'],
      industry: ['отрасль', 'сектор', 'категория', 'тип', 'сфера'],
      priority: ['приоритет', 'важность', 'срочность', 'уровень'],
      status: ['статус', 'этап', 'фаза', 'состояние', 'прогресс']
    },
    pl: {
      title: ['projekt', 'nazwa', 'tytuł', 'temat', 'umowa'],
      clientName: ['klient', 'zamawiający', 'kontakt', 'osoba', 'imię'],
      clientEmail: ['email', 'poczta elektroniczna', 'e-mail', 'adres email'],
      clientCompany: ['firma', 'organizacja', 'przedsiębiorstwo', 'spółka'],
      description: ['opis', 'notatki', 'szczegóły', 'podsumowanie', 'informacje'],
      estimatedBudget: ['budżet', 'cena', 'koszt', 'kwota', 'stawka'],
      timeline: ['termin', 'czas trwania', 'deadline', 'harmonogram', 'ramy czasowe'],
      deliverables: ['zadania', 'zakres', 'funkcje', 'wymagania', 'cele'],
      industry: ['branża', 'sektor', 'kategoria', 'typ', 'dziedzina'],
      priority: ['priorytet', 'ważność', 'pilność', 'poziom'],
      status: ['status', 'etap', 'faza', 'stan', 'postęp']
    }
  }

  /**
   * Detect language from text content
   */
  static detectLanguage(text: string): LanguageDetectionResult {
    const normalizedText = text.toLowerCase()
    const scores: { [key in SupportedLanguage]: number } = {
      en: 0,
      uk: 0,
      ru: 0,
      pl: 0
    }

    // Count keyword matches for each language
    Object.entries(this.languageKeywords).forEach(([lang, keywords]) => {
      keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword.toLowerCase()}\\b`, 'g')
        const matches = normalizedText.match(regex)
        if (matches) {
          scores[lang as SupportedLanguage] += matches.length
        }
      })
    })

    // Character-based detection for Cyrillic scripts
    const cyrillicCount = (normalizedText.match(/[а-яё]/g) || []).length
    const latinCount = (normalizedText.match(/[a-z]/g) || []).length
    const polishChars = (normalizedText.match(/[ąćęłńóśźż]/g) || []).length

    // Boost scores based on character sets
    if (cyrillicCount > 0) {
      const cyrillicRatio = cyrillicCount / (cyrillicCount + latinCount)
      
      // Ukrainian-specific characters
      const ukrainianChars = (normalizedText.match(/[іїєґ]/g) || []).length
      if (ukrainianChars > 0) {
        scores.uk += cyrillicRatio * 10 + ukrainianChars * 2
      } else {
        scores.ru += cyrillicRatio * 10
      }
    }

    if (polishChars > 0) {
      scores.pl += polishChars * 2
    }

    // Determine primary language
    const maxScore = Math.max(...Object.values(scores))
    const primaryLanguage = Object.entries(scores).find(([_, score]) => score === maxScore)?.[0] as SupportedLanguage || 'en'
    
    // Calculate confidence
    const totalScore = Object.values(scores).reduce((sum, score) => sum + score, 0)
    const confidence = totalScore > 0 ? maxScore / totalScore : 0.25

    // Get alternative languages
    const alternatives = Object.entries(scores)
      .filter(([lang, score]) => lang !== primaryLanguage && score > 0)
      .map(([lang, score]) => ({
        language: lang as SupportedLanguage,
        confidence: totalScore > 0 ? score / totalScore : 0
      }))
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 2)

    return {
      language: primaryLanguage,
      confidence: Math.min(1, confidence),
      alternativeLanguages: alternatives.length > 0 ? alternatives : undefined
    }
  }

  /**
   * Get field mappings for a specific language
   */
  static getFieldMappings(language: SupportedLanguage): { [field: string]: string[] } {
    return this.fieldMappings[language] || this.fieldMappings.en
  }

  /**
   * Map header names to field names based on language
   */
  static mapHeaderToField(header: string, language: SupportedLanguage): string | null {
    const mappings = this.getFieldMappings(language)
    const normalizedHeader = header.toLowerCase().trim()

    for (const [field, terms] of Object.entries(mappings)) {
      if (terms.some(term => normalizedHeader.includes(term.toLowerCase()))) {
        return field
      }
    }

    return null
  }

  /**
   * Detect language from headers (useful for CSV/spreadsheet parsing)
   */
  static detectLanguageFromHeaders(headers: string[]): LanguageDetectionResult {
    const headerText = headers.join(' ').toLowerCase()
    return this.detectLanguage(headerText)
  }

  /**
   * Get localized field names for UI display
   */
  static getLocalizedFieldNames(language: SupportedLanguage): { [field: string]: string } {
    const localizedNames: { [key in SupportedLanguage]: { [field: string]: string } } = {
      en: {
        title: 'Project Title',
        clientName: 'Client Name',
        clientEmail: 'Client Email',
        clientCompany: 'Client Company',
        description: 'Description',
        estimatedBudget: 'Estimated Budget',
        timeline: 'Timeline',
        deliverables: 'Deliverables',
        industry: 'Industry',
        priority: 'Priority',
        status: 'Status'
      },
      uk: {
        title: 'Назва проекту',
        clientName: 'Імя клієнта',
        clientEmail: 'Електронна пошта клієнта',
        clientCompany: 'Компанія клієнта',
        description: 'Опис',
        estimatedBudget: 'Орієнтовний бюджет',
        timeline: 'Терміни',
        deliverables: 'Завдання',
        industry: 'Галузь',
        priority: 'Пріоритет',
        status: 'Статус'
      },
      ru: {
        title: 'Название проекта',
        clientName: 'Имя клиента',
        clientEmail: 'Электронная почта клиента',
        clientCompany: 'Компания клиента',
        description: 'Описание',
        estimatedBudget: 'Предполагаемый бюджет',
        timeline: 'Сроки',
        deliverables: 'Задачи',
        industry: 'Отрасль',
        priority: 'Приоритет',
        status: 'Статус'
      },
      pl: {
        title: 'Tytuł projektu',
        clientName: 'Nazwa klienta',
        clientEmail: 'Email klienta',
        clientCompany: 'Firma klienta',
        description: 'Opis',
        estimatedBudget: 'Szacowany budżet',
        timeline: 'Harmonogram',
        deliverables: 'Zadania',
        industry: 'Branża',
        priority: 'Priorytet',
        status: 'Status'
      }
    }

    return localizedNames[language] || localizedNames.en
  }

  /**
   * Validate if text contains meaningful content in the detected language
   */
  static validateLanguageContent(text: string, expectedLanguage: SupportedLanguage): boolean {
    const detection = this.detectLanguage(text)
    
    // Accept if detected language matches expected or confidence is low (mixed content)
    return detection.language === expectedLanguage || detection.confidence < 0.6
  }

  /**
   * Extract language-specific patterns (dates, numbers, etc.)
   */
  static extractLanguageSpecificPatterns(text: string, language: SupportedLanguage): {
    dates: string[]
    currencies: string[]
    phones: string[]
  } {
    const patterns = {
      dates: [] as string[],
      currencies: [] as string[],
      phones: [] as string[]
    }

    // Date patterns by language
    const datePatterns: { [key in SupportedLanguage]: RegExp[] } = {
      en: [
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // MM/DD/YYYY
        /\b\d{1,2}-\d{1,2}-\d{4}\b/g,   // MM-DD-YYYY
        /\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2},?\s+\d{4}\b/gi
      ],
      uk: [
        /\b\d{1,2}\.\d{1,2}\.\d{4}\b/g, // DD.MM.YYYY
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // DD/MM/YYYY
        /\b\d{1,2}\s+(січня|лютого|березня|квітня|травня|червня|липня|серпня|вересня|жовтня|листопада|грудня)\s+\d{4}\b/gi
      ],
      ru: [
        /\b\d{1,2}\.\d{1,2}\.\d{4}\b/g, // DD.MM.YYYY
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // DD/MM/YYYY
        /\b\d{1,2}\s+(января|февраля|марта|апреля|мая|июня|июля|августа|сентября|октября|ноября|декабря)\s+\d{4}\b/gi
      ],
      pl: [
        /\b\d{1,2}\.\d{1,2}\.\d{4}\b/g, // DD.MM.YYYY
        /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g, // DD/MM/YYYY
        /\b\d{1,2}\s+(stycznia|lutego|marca|kwietnia|maja|czerwca|lipca|sierpnia|września|października|listopada|grudnia)\s+\d{4}\b/gi
      ]
    }

    // Currency patterns by language
    const currencyPatterns: { [key in SupportedLanguage]: RegExp[] } = {
      en: [/\$\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g, /USD\s*\d+/gi],
      uk: [/₴\d{1,3}(?:\s\d{3})*(?:,\d{2})?/g, /грн\s*\d+/gi, /UAH\s*\d+/gi],
      ru: [/₽\d{1,3}(?:\s\d{3})*(?:,\d{2})?/g, /руб\s*\d+/gi, /RUB\s*\d+/gi],
      pl: [/\d{1,3}(?:\s\d{3})*(?:,\d{2})?\s*zł/g, /PLN\s*\d+/gi]
    }

    // Extract patterns
    datePatterns[language]?.forEach(pattern => {
      const matches = text.match(pattern) || []
      patterns.dates.push(...matches)
    })

    currencyPatterns[language]?.forEach(pattern => {
      const matches = text.match(pattern) || []
      patterns.currencies.push(...matches)
    })

    // Phone patterns (international)
    const phonePattern = /(?:\+\d{1,3}\s?)?(?:\(\d{1,4}\)\s?)?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g
    const phoneMatches = text.match(phonePattern) || []
    patterns.phones.push(...phoneMatches.filter(phone => phone.replace(/\D/g, '').length >= 7))

    return patterns
  }
}