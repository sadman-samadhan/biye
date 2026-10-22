import test from 'node:test'
import assert from 'node:assert/strict'
import { banglaDate, buildIcs, dateExtraLine, googleCalendarUrl, hijriDate } from '../../lib/calendar.js'
import { countdownEvent, headlineEvent, inviteEvents, isLiveStreamUrl, isMapUrl, rsvpEvents, rsvpState, todaysEvents } from '../../lib/invitation.js'
import { rsvpInputSchema, validateSection } from '../../lib/content/schema.js'

const at = (iso) => new Date(iso)

test('Bangla calendar follows the Bangladesh 2019 revision', () => {
  assert.equal(banglaDate(at('2026-12-16T06:00:00Z')).en, '1 Poush 1433') // Victory Day
  assert.equal(banglaDate(at('2027-02-21T06:00:00Z')).en, '8 Falgun 1433') // Language Martyrs' Day
  assert.equal(banglaDate(at('2027-03-26T06:00:00Z')).en, '12 Chaitra 1433') // Independence Day
  assert.equal(banglaDate(at('2027-04-14T06:00:00Z')).en, '1 Boishakh 1434')
  assert.equal(banglaDate(at('2028-03-14T06:00:00Z')).en, '30 Falgun 1434') // leap-year Falgun
  assert.equal(banglaDate(at('2026-12-12T13:30:00Z')).bn, '২৭ অগ্রহায়ণ ১৪৩৩ বঙ্গাব্দ')
  // 23:30 in Dhaka on 13 April is still the last day of Chaitra
  assert.equal(banglaDate(at('2027-04-13T17:30:00Z')).en, '30 Chaitra 1433')
})

test('Hijri line and tradition extras', () => {
  assert.match(hijriDate(at('2026-12-12T13:30:00Z')).en, /^\d+ Rajab 1448 AH$/)
  assert.match(hijriDate(at('2026-12-12T13:30:00Z')).bn, /হিজরি$/)
  assert.equal(dateExtraLine('2026-12-12T19:30:00+06:00', []), null)
  assert.match(dateExtraLine('2026-12-12T19:30:00+06:00', ['bangla-calendar']).en, /Agrahayan/)
  assert.equal(dateExtraLine('', ['hijri']), null)
})

test('ics: UTC times, escaping, folding, default end', () => {
  const ics = buildIcs({
    calendarName: 'A & B',
    url: 'https://shubhobiye.com/a-b',
    now: at('2026-10-23T00:00:00Z'),
    events: [
      { id: 'biye.1', title: 'বিয়ে, The Wedding; a very long title that has to be folded across more than one line', startsAt: '2026-12-12T19:30:00+06:00', location: 'Hall 1, Dhaka' },
      { id: 'no-time', title: 'Skipped', startsAt: '' },
    ],
  })
  assert.match(ics, /DTSTART:20261212T133000Z\r\n/)
  assert.match(ics, /DTEND:20261212T163000Z\r\n/)
  assert.match(ics, /LOCATION:Hall 1\\, Dhaka/)
  assert.equal((ics.match(/BEGIN:VEVENT/g) || []).length, 1)
  for (const line of ics.split('\r\n')) assert.ok(Buffer.byteLength(line) <= 75, line)
  assert.ok(ics.includes('\r\n '), 'long lines are folded')
  assert.ok(googleCalendarUrl({ title: 'x', startsAt: '2026-12-12T19:30:00+06:00' }).includes('dates=20261212T133000Z%2F20261212T163000Z'))
})

const ceremonies = [
  { id: 'holud', title: { en: 'Holud' }, startsAt: '2026-12-10T17:00:00+06:00' },
  { id: 'biye', title: { en: 'Wedding' }, startsAt: '2026-12-12T19:30:00+06:00' },
  { id: 'hidden', enabled: false, startsAt: '2026-12-11T10:00:00+06:00' },
  { id: 'family', onInvite: false, startsAt: '2026-12-11T10:00:00+06:00' },
  { id: 'reception', rsvp: false, startsAt: '2026-12-14T13:00:00+06:00' },
]

test('which events the invitation shows and counts down to', () => {
  assert.deepEqual(inviteEvents(ceremonies).map((c) => c.id), ['holud', 'biye', 'reception'])
  assert.deepEqual(rsvpEvents(ceremonies).map((c) => c.id), ['holud', 'biye'])
  assert.equal(countdownEvent({}, ceremonies, at('2026-11-01T00:00:00Z')).id, 'holud')
  assert.equal(countdownEvent({}, ceremonies, at('2026-12-11T00:00:00Z')).id, 'biye')
  assert.equal(countdownEvent({ countdownTo: 'biye' }, ceremonies, at('2026-11-01T00:00:00Z')).id, 'biye')
  const isMain = (c) => c.id === 'biye'
  assert.equal(countdownEvent({}, ceremonies, at('2026-11-01T00:00:00Z'), isMain).id, 'biye')
  assert.equal(countdownEvent({}, ceremonies, at('2026-12-13T00:00:00Z'), isMain).id, 'reception')
  assert.equal(headlineEvent({}, ceremonies, at('2026-12-13T00:00:00Z'), isMain).id, 'biye')
  assert.deepEqual(todaysEvents(ceremonies, at('2026-12-12T04:00:00Z')).map((c) => c.id), ['biye'])
})

test('RSVP opens and closes in Dhaka time', () => {
  const invitation = { rsvp: { enabled: true, deadline: '2026-12-01' } }
  assert.equal(rsvpState({}, ceremonies).open, false)
  assert.equal(rsvpState(invitation, ceremonies, at('2026-12-01T17:59:00Z')).open, true) // 23:59 Dhaka
  assert.equal(rsvpState(invitation, ceremonies, at('2026-12-01T18:01:00Z')).open, false) // 00:01 next day
  const noDeadline = { rsvp: { enabled: true } }
  assert.equal(rsvpState(noDeadline, ceremonies, at('2026-12-12T13:00:00Z')).open, true)
  assert.equal(rsvpState(noDeadline, ceremonies, at('2026-12-12T14:00:00Z')).open, false)
  assert.equal(rsvpState(invitation, [], at('2026-11-01T00:00:00Z')).open, false)
})

test('map and livestream links are restricted', () => {
  assert.ok(isMapUrl('https://maps.app.goo.gl/abc'))
  assert.ok(isMapUrl('https://www.google.com/maps/place/Dhaka'))
  assert.ok(isMapUrl('https://maps.apple.com/?q=Dhaka'))
  assert.ok(!isMapUrl('https://www.google.com/search?q=x'))
  assert.ok(!isMapUrl('http://maps.app.goo.gl/abc'))
  assert.ok(!isMapUrl('https://evil.example/maps'))
  assert.ok(isLiveStreamUrl('https://youtube.com/live/abc'))
  assert.ok(isLiveStreamUrl('https://www.facebook.com/x/videos/1'))
  assert.ok(!isLiveStreamUrl('https://twitch.tv/x'))
  assert.equal(validateSection('ceremonies', [{ id: 'a', venue: { mapUrl: 'https://evil.example' } }]).ok, false)
  assert.equal(validateSection('ceremonies', [{ id: 'a', venue: { mapUrl: 'https://maps.app.goo.gl/x' }, liveStreamUrl: 'https://youtu.be/x' }]).ok, true)
})

test('invitation and RSVP input validation', () => {
  assert.equal(validateSection('invitation', { hosts: [{ side: 'bride', relation: 'daughter', child: { en: 'A' } }], rsvp: { enabled: true, maxParty: 4, deadline: '2026-12-01' } }).ok, true)
  assert.equal(validateSection('invitation', { rsvp: { maxParty: 99 } }).ok, false)
  assert.equal(validateSection('invitation', { rsvp: { deadline: 'tomorrow' } }).ok, false)
  assert.equal(validateSection('invitation', { hosts: [{ side: 'aunt', relation: 'son' }] }).ok, false)
  assert.equal(rsvpInputSchema.safeParse({ name: 'Rahim', attending: true, partySize: 3, events: ['biye'] }).success, true)
  assert.equal(rsvpInputSchema.safeParse({ name: ' ', attending: true, partySize: 3, events: [] }).success, false)
  assert.equal(rsvpInputSchema.safeParse({ name: 'x', attending: true, partySize: 3, events: [], admin: true }).success, false)
  assert.equal(rsvpInputSchema.safeParse({ name: 'x', attending: true, partySize: 3, events: [], phone: '=cmd()' }).success, false)
})
