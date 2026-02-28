export type Language = "ru" | "en";

export const translations = {
  // App
  "app.title": { ru: "Todo App", en: "Todo App" },
  "app.subtitle": { ru: "Управляйте задачами эффективно", en: "Manage tasks efficiently" },

  // Auth
  "auth.loginWithGoogle": { ru: "Войти через Google", en: "Sign in with Google" },
  "auth.logout": { ru: "Выйти", en: "Log out" },
  "auth.user": { ru: "Пользователь", en: "User" },

  // User menu
  "menu.settings": { ru: "Настройки", en: "Settings" },
  "menu.theme": { ru: "Тема", en: "Theme" },
  "menu.lightTheme": { ru: "Светлая тема", en: "Light theme" },
  "menu.darkTheme": { ru: "Тёмная тема", en: "Dark theme" },
  "menu.language": { ru: "Язык", en: "Language" },
  "menu.russian": { ru: "Русский", en: "Russian" },
  "menu.english": { ru: "English", en: "English" },

  // Sidebar
  "sidebar.allTasks": { ru: "Все задачи", en: "All tasks" },
  "sidebar.calendar": { ru: "Календарь", en: "Calendar" },
  "sidebar.categories": { ru: "Категории", en: "Categories" },

  // Categories
  "category.work": { ru: "Работа", en: "Work" },
  "category.study": { ru: "Учёба", en: "Study" },
  "category.hobbies": { ru: "Хобби", en: "Hobbies" },
  "category.personal": { ru: "Личное", en: "Personal" },
  "category.shopping": { ru: "Покупки", en: "Shopping" },
  "category.health": { ru: "Здоровье", en: "Health" },

  // Subcategories
  "subcategory.programming": { ru: "Программирование", en: "Programming" },
  "subcategory.youtube": { ru: "YouTube", en: "YouTube" },
  "subcategory.other": { ru: "Другое", en: "Other" },
  "subcategory.french": { ru: "Французский", en: "French" },
  "subcategory.english": { ru: "Английский", en: "English" },
  "subcategory.music": { ru: "Музыка", en: "Music" },

  // Todo form
  "form.newTask": { ru: "Новая задача", en: "New task" },
  "form.editTask": { ru: "Редактировать задачу", en: "Edit task" },
  "form.title": { ru: "Название *", en: "Title *" },
  "form.titlePlaceholder": { ru: "Что нужно сделать?", en: "What needs to be done?" },
  "form.description": { ru: "Описание", en: "Description" },
  "form.descriptionPlaceholder": { ru: "Подробности...", en: "Details..." },
  "form.category": { ru: "Категория *", en: "Category *" },
  "form.categoryPlaceholder": { ru: "Выберите...", en: "Select..." },
  "form.subcategory": { ru: "Подкатегория", en: "Subcategory" },
  "form.priority": { ru: "Приоритет", en: "Priority" },
  "form.deadline": { ru: "Дедлайн", en: "Deadline" },
  "form.cancel": { ru: "Отмена", en: "Cancel" },
  "form.save": { ru: "Сохранить", en: "Save" },
  "form.create": { ru: "Создать", en: "Create" },

  // Priorities
  "priority.high": { ru: "Высокий", en: "High" },
  "priority.medium": { ru: "Средний", en: "Medium" },
  "priority.low": { ru: "Низкий", en: "Low" },

  // Sort
  "sort.byDate": { ru: "По дате", en: "By date" },
  "sort.byPriority": { ru: "По приоритету", en: "By priority" },
  "sort.byDeadline": { ru: "По дедлайну", en: "By deadline" },

  // Empty states
  "empty.noTasks": { ru: "Нет задач. Создайте первую!", en: "No tasks. Create the first one!" },

  // Completed
  "completed.title": { ru: "Выполненные", en: "Completed" },

  // Confirm dialog
  "confirm.deleteTask": { ru: "Удалить задачу?", en: "Delete task?" },
  "confirm.deleteMessage": { ru: "будет удалена навсегда.", en: "will be deleted permanently." },
  "confirm.cancel": { ru: "Отмена", en: "Cancel" },
  "confirm.delete": { ru: "Удалить", en: "Delete" },

  // Calendar
  "calendar.today": { ru: "Сегодня", en: "Today" },
  "calendar.more": { ru: "ещё", en: "more" },
  "calendar.addTask": { ru: "+ Задача", en: "+ Task" },
  "calendar.selectDate": { ru: "Выберите дату", en: "Select date" },

  // Weekdays
  "weekday.mon": { ru: "Пн", en: "Mo" },
  "weekday.tue": { ru: "Вт", en: "Tu" },
  "weekday.wed": { ru: "Ср", en: "We" },
  "weekday.thu": { ru: "Чт", en: "Th" },
  "weekday.fri": { ru: "Пт", en: "Fr" },
  "weekday.sat": { ru: "Сб", en: "Sa" },
  "weekday.sun": { ru: "Вс", en: "Su" },

  // Months
  "month.january": { ru: "Январь", en: "January" },
  "month.february": { ru: "Февраль", en: "February" },
  "month.march": { ru: "Март", en: "March" },
  "month.april": { ru: "Апрель", en: "April" },
  "month.may": { ru: "Май", en: "May" },
  "month.june": { ru: "Июнь", en: "June" },
  "month.july": { ru: "Июль", en: "July" },
  "month.august": { ru: "Август", en: "August" },
  "month.september": { ru: "Сентябрь", en: "September" },
  "month.october": { ru: "Октябрь", en: "October" },
  "month.november": { ru: "Ноябрь", en: "November" },
  "month.december": { ru: "Декабрь", en: "December" },

  // Months short
  "monthShort.jan": { ru: "Янв", en: "Jan" },
  "monthShort.feb": { ru: "Фев", en: "Feb" },
  "monthShort.mar": { ru: "Мар", en: "Mar" },
  "monthShort.apr": { ru: "Апр", en: "Apr" },
  "monthShort.may": { ru: "Май", en: "May" },
  "monthShort.jun": { ru: "Июн", en: "Jun" },
  "monthShort.jul": { ru: "Июл", en: "Jul" },
  "monthShort.aug": { ru: "Авг", en: "Aug" },
  "monthShort.sep": { ru: "Сен", en: "Sep" },
  "monthShort.oct": { ru: "Окт", en: "Oct" },
  "monthShort.nov": { ru: "Ноя", en: "Nov" },
  "monthShort.dec": { ru: "Дек", en: "Dec" },

  // Settings
  "settings.title": { ru: "Настройки", en: "Settings" },
  "settings.comingSoon": { ru: "Скоро будет доступно", en: "Coming soon" },
} as const;

export type TranslationKey = keyof typeof translations;

// Helper arrays derived from translations
export const MONTH_KEYS: TranslationKey[] = [
  "month.january", "month.february", "month.march", "month.april",
  "month.may", "month.june", "month.july", "month.august",
  "month.september", "month.october", "month.november", "month.december",
];

export const MONTH_SHORT_KEYS: TranslationKey[] = [
  "monthShort.jan", "monthShort.feb", "monthShort.mar", "monthShort.apr",
  "monthShort.may", "monthShort.jun", "monthShort.jul", "monthShort.aug",
  "monthShort.sep", "monthShort.oct", "monthShort.nov", "monthShort.dec",
];

export const WEEKDAY_KEYS: TranslationKey[] = [
  "weekday.mon", "weekday.tue", "weekday.wed", "weekday.thu",
  "weekday.fri", "weekday.sat", "weekday.sun",
];

// Map Russian category/subcategory names to translation keys
export const CATEGORY_NAME_MAP: Record<string, TranslationKey> = {
  "Работа": "category.work",
  "Учёба": "category.study",
  "Хобби": "category.hobbies",
  "Личное": "category.personal",
  "Покупки": "category.shopping",
  "Здоровье": "category.health",
  "Программирование": "subcategory.programming",
  "YouTube": "subcategory.youtube",
  "Другое": "subcategory.other",
  "Французский": "subcategory.french",
  "Английский": "subcategory.english",
  "Музыка": "subcategory.music",
};
