import { reduceToSingleDigit } from '../utils'
import { makeResult, reductionChain } from './_helpers'
import type { NumberResult } from '../types'

/**
 * Life Path — reducing-down method:
 * 1. Reduce month, day, year each separately (preserve 11 / 22 if they arise)
 * 2. Sum the three reduced parts
 * 3. Reduce the total (preserve 11, 22, 33)
 */
export function calculateLifePath(birthDate: string): NumberResult {
  const [yearStr, monthStr, dayStr] = birthDate.split('-')
  const month = parseInt(monthStr, 10)
  const day   = parseInt(dayStr,   10)
  const rMonth = reduceToSingleDigit(month)
  const rDay   = reduceToSingleDigit(day)
  const rYear  = reduceToSingleDigit(parseInt(yearStr, 10))

  const compound = rMonth + rDay + rYear
  const value    = reduceToSingleDigit(compound)

  const monthPart = rMonth === month ? `Tháng: ${month}` : `Tháng: ${month}→${rMonth}`
  const dayPart   = rDay === day     ? `Ngày: ${day}`    : `Ngày: ${day}→${rDay}`
  const yearPart  = `Năm: ${(yearStr ?? '').split('').join('+')}=${rYear}`
  const totalPart = compound === value
    ? `Tổng: ${rMonth}+${rDay}+${rYear}=${value}`
    : `Tổng: ${rMonth}+${rDay}+${rYear}=${compound}→${value}`

  const workings = `${monthPart} | ${dayPart} | ${yearPart} | ${totalPart}`
  return makeResult(compound, value, workings)
}
