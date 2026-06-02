// Mock feed entries shared between /feed and /journal/[id].

import type { AvatarId } from './avatars'

export type FeedReaction = {
  emoji: string
  count: number
}

export type FeedComment = {
  id: number
  author: string
  avatar: string
  avatarBg: string
  avatarTextColor: string
  timestamp: string
  authorColor: string
  content: string
}

export type FeedEntry = {
  id: string
  author: string
  authorHandle: string
  avatarUrl: string
  avatarId?: AvatarId
  timestamp: string
  category?: string
  title: string
  paragraphs: string[]
  imageUrl?: string
  imageAlt?: string
  quote?: { text: string; attribution: string }
  tags?: string[]
  reactions: FeedReaction[]
  comments: FeedComment[]
  /** Strip card accent */
  stripVariant?: 'secondary' | 'primary' | 'surface'
}

export const FEED_ENTRIES: FeedEntry[] = [
  {
    id: 'morning-coffee',
    author: 'Wanderer',
    authorHandle: '@wanderer_8bit',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBgYyZT8OeL4S-C2LLFRmQy2t89hGeUTSWBemxbRFW1MMP-qxi3Z9hzqOdDQ09un2ECtk6gkFg04qtRdyUYjwWRwDO_YaeJrVjMXAON_sAz3EA3v57fOcIyD8Oe8BySa4I48ZTn6vKTGTFvRWCilS7ESp-k7ys9T0pvtduLNzq4Zp4gPVH8AyZfQR0FRKWWfuHwAatBxMRAcDb3dqJ-GVMoZd7scm1s8kMOKW7liObqprRl4hU2vYAzMsTOEIqw-uWsrWTcgjWCFTzc',
    timestamp: '2 hrs ago',
    category: 'Daily',
    title: 'Morning Coffee Rituals',
    paragraphs: [
      'The kettle whistles like an old game startup chime. I grind the beans, watch the steam rise in pixel-perfect curls, and pretend the whole day might go right.',
      'Same mug, same window, same quiet before campus wakes up. Small rituals keep the log honest.',
    ],
    reactions: [
      { emoji: '☕', count: 12 },
      { emoji: '❤️', count: 8 },
    ],
    comments: [],
    stripVariant: 'secondary',
  },
  {
    id: 'debugging-soul',
    author: 'Code Poet',
    authorHandle: '@code_poet',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAek_5qFydD3AW-ZFJF_q_hmo3tj-Gl5BRWa3p01lI_8R2aHtkEFlj_7F2cdDTxEAm9V53ymtf8K9MCTZkZkuKyxPQNkQaW4m2dZNXGmwbgHfZ2aQRPpUgZJ8fs0YKUFi-h_qGRC0b9cd6ZGCxfRiDZH-YjBt9-nfMYVChjcPfia_5F61O2qFyCSAFPYHfkHSyQtxnnHWju1QRfcbrXrbifnGOY4YIzQMbuXBDz2nG-kENrd5uSe-rYnGg9bQtIN2RpINbRJxiVBlDy',
    timestamp: '4 hrs ago',
    category: 'Reflection',
    title: 'Debugging the Soul',
    paragraphs: [
      'Stack trace of the day: woke up tired, fixed one bug, introduced two feelings. Stepped away from the screen and the error cleared.',
      'Maybe the soul just needed a breakpoint and a walk.',
    ],
    reactions: [
      { emoji: '🐛', count: 42 },
      { emoji: '💻', count: 15 },
    ],
    comments: [],
    stripVariant: 'primary',
  },
  {
    id: 'harvesting-carrots',
    author: 'Pixel Gardener',
    authorHandle: '@pixel_gardener',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAdB4umsG0oHyMisPH6_EWs7x4D_IKcfyB9pTx7Vw9z5RTGZefl6O-vHk1V57QR3e4Me66j5CRFMtir6kMZTJDU3JS1RO677f-GnIENmpA5IZo5efPQECZ19IQnnAsPAsfC48HJwdw7oKHLH7ffQEoXdNlGvC5m4nMktwKBF4S8UTQEewkb0SENnRiU7nI4G_lN1sHODXaggGIOQ8fjr55hAzjBvP70ykOVJTZvGJ5a1l2fi1cgkVzs3i2cDpjKcP3sqGKQYzftm3F5',
    timestamp: '6 hrs ago',
    category: 'Campus',
    title: 'Harvesting Digital Carrots',
    paragraphs: [
      'Planted focus seeds in the library corner. Most sprouted as notifications. Still, a few rows came up golden.',
      'Tomorrow I water the quiet hours instead of the feed.',
    ],
    reactions: [
      { emoji: '🥕', count: 20 },
      { emoji: '🌱', count: 33 },
    ],
    comments: [],
    stripVariant: 'surface',
  },
  {
    id: 'hidden-trail',
    author: 'Retro Hiker',
    authorHandle: '@retro_hiker',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzrjUAYxw_J4RiP0c33KLK89PimTAv8ynN9wZv6RliPrC1yOjEiIvD6uzw5529LVI5-pwS29usRm4sy3yk5wxOZjPKScukCn_XxDoQqW1on1gb-roRxTyEOG4bNRnkQfh-1TLh8oa2TR3cC64PQnKL7hfgBY23M9erlrApXw27yU5GcLXeeK3qOuSDZ3fC0jthJNjbiJoaLJk00n132t1pq4Xi7MWmaw0I42ReK8jJ2x8NlhkN8KJ_z7oR27pbXw3ORJj2B9sC7M3S',
    timestamp: 'October 24, 199X',
    category: 'Adventure',
    title: 'Hidden Trail at Dusk',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAjD0C29FFW-x1VUlzmGUc31QV2eotsWYcqlJanq0P6G6z6QfifqcdGy1WFI46zaUe0c0mncezcEfZSzII8TZZBSumO1cT3xRcYPq_xS_8dbPz9-uMa7K_Y5jGvCgFJcalqTicjPLbJc8t61eKyzBaCAV4f75mgsneMrimxwEm6FQxfJLcyEOgdVGexYKOfYVyI3CDnyG-RcZJa4_-oxz17pnW3cjIeE3hmp9zb50YG1iMPaZrz7Ir4lao7I9M3g3Pzsto0osDe2fzr',
    imageAlt: 'Abstract pixel landscape at dusk',
    paragraphs: [
      "Found a hidden trail today that felt straight out of an old RPG. The trees were dense, and the light filtering through looked like glowing pixels.",
      'I did not take many photos. I wanted to remember the sound of leaves instead.',
    ],
    reactions: [
      { emoji: '🌲', count: 5 },
      { emoji: '❤️', count: 12 },
    ],
    comments: [],
  },
  {
    id: 'sound-of-rain',
    author: 'Lofi Beats',
    authorHandle: '@lofi_beats',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBMwfrKgkA-VbTEet6-0wEDwCHlrxANzmSaQZIETY3vM0fgadoj5lOOYkxCw5wynvFOPEwLVYlKPWdLfTpDLcMy8-OjKg9cI4ZTz7DNhfck3tGAHefNYZDtFmDkrGb_uULBkjksTIua8C6tvw_gsfqpZkv1u6ZP_0gMBy4eQLKhnUGY7j5HiqSVs72V-py_9_f_KsS7Fqdrk9sCSW0bqi5Lj-18oy9IQvhtP52mhxYTwylAqx3YL1O1sSc0YpIDVJDrO2lcQzaGG8iQ',
    timestamp: 'Yesterday',
    category: 'Mood',
    title: 'The Sound of Rain',
    paragraphs: [
      "There is nothing quite like the sound of heavy rain hitting the roof while you're safe inside compiling code. It provides a natural white noise that helps focus better than any ambient track.",
    ],
    tags: ['#coding', '#rain'],
    reactions: [
      { emoji: '🌧️', count: 8 },
      { emoji: '🎧', count: 14 },
    ],
    comments: [],
  },
  {
    id: 'system-reboot',
    author: 'Caffeine Loop',
    authorHandle: '@caffeine_loop',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDgtWJVb-00TvzfflbU4GQYnEcHoBWucH-C9mFjJteaC8NfcizggxaqSVL0TOrYbMsNtZIlhxr6Ppf0L9Z_jzlbo-aiFLhhNesRSt2iDl4LqLkVnrrrp-DIC3Mvr_nLhzs77in8mYfcwgewCLxz4FumhZKhIBtZWobS7c1i17pXdsxKMlqsg6yQWPfVtr4v-AvXhzQ1xo9TJJQRwoXCuvpAHbkNGdEw-kRpL9hexSNKAflWQh3pnJo-IfnGhqQQMm6YB5eWzA1pVcrJ',
    timestamp: 'October 23, 199X',
    category: 'Status',
    title: 'System Reboot Required',
    paragraphs: ['Out of coffee. Out of ideas. Brb going to the store.'],
    reactions: [{ emoji: '⚠️', count: 22 }],
    comments: [],
  },
  {
    id: 'battle-station',
    author: 'Sketch Pad',
    authorHandle: '@sketch_pad',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuD_DaK5VEp6cEB-6KySl8BVjLrYStDnOHUi6E05Kbb7X52qX0wVzh6DqB-FOiWxWhTTEvDHj5XsGINcbKnh-O7hrNWymklh-5gvxFNdu5bS8ZCpj7xD3wYJqmFXzv7pqrqGBVEcPkHmsFMr4SLA1f_TL9ISHf8-jJMFwnMOIfC1XZiPEGIRcoiDHIYPvEundT5pe3kUENaFLyDuNrhGpIt73IX37gnBGo9Lk1wQXqyHgdd00ZJYA7W2HxSOe21SppJ15tns7RMGxnYi',
    timestamp: 'October 22, 199X',
    category: 'Setup',
    title: 'New Battle Station',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDdSIDjns4imuO8qZN0f7EuxtvfJMBcj0znvQmT2r45LqWJqOXLsR5LHKXu32cR2lrwJlnlV_YJvH0kbWRpFSZl0ei42pBcQlHcWNuoU7wYY6jGKRhnCaRnc0RWGUOmu80VyGdazhxGPb-jUgo-uEwfW8EMuV4HcW-YucKXKqcj5Vq-MWSFDkyVTE1pcLjgp9OusekGTlzqFvIlkEK8mpzA3v31UOsEjnZNsjB63SrgkyMuxAOXCz-DRd6cpWPtvhB1aOxMJy9XOQk2',
    imageAlt: 'Retro workspace with CRT monitor',
    paragraphs: [
      'Setting up the new battle station. Found this old CRT monitor at a thrift store and it still works perfectly for terminal activities.',
    ],
    reactions: [
      { emoji: '🖥️', count: 15 },
      { emoji: '🔥', count: 7 },
    ],
    comments: [],
  },
  {
    id: 'dragon-emblem',
    author: 'Chronicler',
    authorHandle: '@ember_scribe',
    avatarUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDzrjUAYxw_J4RiP0c33KLK89PimTAv8ynN9wZv6RliPrC1yOjEiIvD6uzw5529LVI5-pwS29usRm4sy3yk5wxOZjPKScukCn_XxDoQqW1on1gb-roRxTyEOG4bNRnkQfh-1TLh8oa2TR3cC64PQnKL7hfgBY23M9erlrApXw27yU5GcLXeeK3qOuSDZ3fC0jthJNjbiJoaLJk00n132t1pq4Xi7MWmaw0I42ReK8jJ2x8NlhkN8KJ_z7oR27pbXw3ORJj2B9sC7M3S',
    timestamp: 'October 24, 199X',
    category: 'Adventure',
    title: 'The Dragon of Mount Ember',
    imageUrl:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDvgBL5cfNM4apSQ7WpyFhDYhvPJ_WFZ2rnEojgXxwaehfxpVbvjjkAS0ZmvY30sFmVpAl8EZrHiKKiAa_vxJptRgUYyBaIHy_aVECm-n8hxBnG15h3R-PXcGg1OfC8DHAcvthsOXNAp02tTpYFrsP1CCTQYdWJozTpRhaM5JwwD8WKANa5JuSpupKFLqWeLkz40EHPYnrk0GCPyTy7tX2ohLCJQAUQA2XvGQyBnrblFnKpWhirz-J5K1ba-SBFu4M2m53aBiaDhrEq',
    imageAlt: 'Pixel-art mountain peak at sunset',
    paragraphs: [
      'We finally reached the summit just as the sun began to dip below the horizon. The air up here is thin, tasting of ash and ozone. My party is exhausted.',
      "But looking out over the expanse of the Ember Wastes, bathed in that dusty rose light... it almost makes the climb worth it. The dragon's lair isn't a cave; it's a colossal crater.",
      "Tomorrow, we descend. Tonight, we rest and count our remaining potions.",
    ],
    quote: {
      text: 'Do not seek the flame unless you are prepared to burn away what you no longer need.',
      attribution: 'Ancient Wastes Proverb',
    },
    reactions: [
      { emoji: '❤️', count: 42 },
      { emoji: '⭐', count: 12 },
      { emoji: '🔥', count: 89 },
    ],
    comments: [
      {
        id: 1,
        author: 'Garris_The_Tank',
        avatar: 'G',
        avatarBg: 'bg-primary-container',
        avatarTextColor: 'text-on-primary-container',
        timestamp: 'Oct 24 - 21:04',
        authorColor: 'text-primary',
        content:
          "Still mad about my shield. But I'll admit, the view is spectacular. Let's hope those potions hold out.",
      },
      {
        id: 2,
        author: 'Elara_Mage',
        avatar: 'E',
        avatarBg: 'bg-secondary-container',
        avatarTextColor: 'text-on-secondary-container',
        timestamp: 'Oct 24 - 22:15',
        authorColor: 'text-secondary',
        content:
          'Mana is slowly recovering. The ambient magic up here is wild. Be careful sketching, you might accidentally draw a summoning rune.',
      },
    ],
  },
]

const ENTRY_MAP = new Map(FEED_ENTRIES.map((e) => [e.id, e]))

export function getFeedEntry(id: string): FeedEntry | undefined {
  return ENTRY_MAP.get(id)
}

export function getAuthorSlugFromHandle(authorHandle: string): string {
  return authorHandle.replace(/^@/, '').toLowerCase()
}

export function getFeedEntriesByAuthorSlug(authorSlug: string): FeedEntry[] {
  return FEED_ENTRIES.filter(
    (entry) => getAuthorSlugFromHandle(entry.authorHandle) === authorSlug.toLowerCase()
  )
}

export const TODAY_STRIP_IDS = ['morning-coffee', 'debugging-soul', 'harvesting-carrots'] as const

export const EXPLORE_FEED_IDS = [
  'hidden-trail',
  'sound-of-rain',
  'system-reboot',
  'battle-station',
] as const
