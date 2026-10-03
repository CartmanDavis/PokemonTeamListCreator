/** Problems with the pasted team, each with a message meant to be shown to the user. */
export class TeamsheetError extends Error {
  readonly issues: string[]

  constructor(issues: string[]) {
    super(issues.join('\n'))
    this.name = 'TeamsheetError'
    this.issues = issues
  }
}

/** A screenshot that can't be read as a Battle Team, with a message meant to be shown to the user. */
export class ScreenshotError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScreenshotError'
  }
}
