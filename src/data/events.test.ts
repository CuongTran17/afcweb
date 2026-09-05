import { events } from './events'

describe('events', () => {
  it('keeps public event identifiers unique', () => {
    expect(new Set(events.map((event) => event.id)).size).toBe(events.length)
  })

  it('provides at least one real image for every published event', () => {
    expect(events.every((event) => event.images.length > 0)).toBe(true)
  })
})
