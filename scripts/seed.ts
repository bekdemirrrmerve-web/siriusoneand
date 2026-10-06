import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  const today = new Date()
  const y = today.getFullYear()
  const m = today.getMonth()
  const d = today.getDate()

  // Events
  const events = [
    { title: 'Ürün tasarım toplantısı', startTime: new Date(y, m, d, 9, 0), endTime: new Date(y, m, d, 10, 0), color: '#6677FF' },
    { title: 'Spor salonu', startTime: new Date(y, m, d, 10, 30), endTime: new Date(y, m, d, 11, 30), color: '#5FD39B' },
    { title: 'Selin ile öğle yemeği', startTime: new Date(y, m, d, 13, 0), endTime: new Date(y, m, d, 14, 0), color: '#8C63FF' },
    { title: 'Müşteri sunumu', startTime: new Date(y, m, d, 15, 0), endTime: new Date(y, m, d, 16, 30), color: '#F4B85E' },
    { title: 'Akşam yemeği', startTime: new Date(y, m, d, 19, 0), endTime: new Date(y, m, d, 20, 30), color: '#55B8FF' },
  ]

  for (const event of events) {
    await prisma.event.upsert({
      where: { id: `seed-event-${event.title.replace(/\s/g, '-')}` },
      update: { ...event },
      create: { id: `seed-event-${event.title.replace(/\s/g, '-')}`, ...event },
    })
  }

  // Contacts
  const contacts = [
    { id: 'seed-contact-anne', name: 'Anne', phone: '+90 532 111 2233', relationship: 'anne' },
    { id: 'seed-contact-baba', name: 'Baba', phone: '+90 532 444 5566', relationship: 'baba' },
    { id: 'seed-contact-kaan', name: 'Kaan', phone: '+90 535 777 8899', relationship: 'eş' },
    { id: 'seed-contact-selin', name: 'Selin', phone: '+90 533 222 3344', relationship: 'arkadaş' },
    { id: 'seed-contact-kuafor', name: 'Kuaför Ayşe', phone: '+90 212 555 6677', relationship: 'kuaför' },
    { id: 'seed-contact-ali', name: 'Ali', phone: '+90 534 888 9900', relationship: 'iş arkadaşı' },
  ]

  for (const c of contacts) {
    await prisma.contact.upsert({
      where: { id: c.id },
      update: { name: c.name, phone: c.phone, relationship: c.relationship },
      create: c,
    })
  }

  // Memories
  const memories = [
    { id: 'seed-mem-1', type: 'profile', content: 'Merve, İstanbul\'da yaşıyor.', entities: ['Merve', 'İstanbul'], importance: 9 },
    { id: 'seed-mem-2', type: 'preferences', content: 'Merve cappuccino seviyor.', entities: ['Merve', 'cappuccino'], importance: 7 },
    { id: 'seed-mem-3', type: 'people', content: 'Kaan, Merve\'nin eşi.', entities: ['Kaan', 'Merve'], importance: 10 },
    { id: 'seed-mem-4', type: 'people', content: 'Ayaz, Merve\'nin çocuğu.', entities: ['Ayaz', 'Merve'], importance: 10 },
    { id: 'seed-mem-5', type: 'habits', content: 'Merve salı günleri içerik çekimi yapıyor.', entities: ['Merve'], importance: 6 },
    { id: 'seed-mem-6', type: 'preferences', content: 'Merve akşam 22:00\'dan sonra rahatsız edilmekten hoşlanmıyor.', entities: ['Merve'], importance: 8 },
    { id: 'seed-mem-7', type: 'important_dates', content: 'Kaan\'\u0131n doğum günü 15 Mart.', entities: ['Kaan'], importance: 8 },
  ]

  for (const mem of memories) {
    await prisma.memory.upsert({
      where: { id: mem.id },
      update: { content: mem.content, entities: mem.entities, importance: mem.importance, type: mem.type },
      create: { ...mem, source: 'seed', confidence: 0.95 },
    })
  }

  // Tasks
  const tasks = [
    { id: 'seed-task-1', title: 'Müşteri sunumu hazırla', priority: 'high', category: 'iş', dueDate: new Date(y, m, d) },
    { id: 'seed-task-2', title: 'Kuaför randevusu al', priority: 'medium', category: 'kişisel' },
    { id: 'seed-task-3', title: 'Haftalık alışveriş listesi', priority: 'low', category: 'kişisel' },
  ]

  for (const t of tasks) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: { title: t.title, priority: t.priority, category: t.category },
      create: { ...t, status: 'pending', dueDate: t.dueDate ?? null },
    })
  }

  // Notifications
  const notifications = [
    { id: 'seed-notif-1', title: 'Toplantıya 15 dakika', body: 'Ürün tasarım toplantısı 09:00\'da başlıyor.', type: 'reminder' },
    { id: 'seed-notif-2', title: 'Günaydın!', body: 'Bugün 5 etkinliğin ve 3 görevin var.', type: 'info' },
  ]

  for (const n of notifications) {
    await prisma.notification.upsert({
      where: { id: n.id },
      update: { title: n.title, body: n.body },
      create: n,
    })
  }

  // Default settings
  const settingsDefaults = [
    { key: 'theme', value: '"midnight"' },
    { key: 'ai_provider', value: '"abacus"' },
    { key: 'ai_model', value: '"gpt-5.4-mini"' },
    { key: 'avatar_style', value: '"orb"' },
    { key: 'stt_provider', value: '"web_speech"' },
    { key: 'tts_provider', value: '"web_speech"' },
    { key: 'voice_speed', value: '1' },
    { key: 'auto_memory', value: 'true' },
    { key: 'save_transcripts', value: 'true' },
    { key: 'proactivity_level', value: '"balanced"' },
  ]

  for (const s of settingsDefaults) {
    await prisma.setting.upsert({
      where: { key: s.key },
      update: {},
      create: s,
    })
  }

  console.log('Seed completed!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
