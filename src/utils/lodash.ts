import reduce from 'lodash-es/reduce'
import extend from 'lodash-es/extend'
import pickBy from 'lodash-es/pickBy'
import isNil from 'lodash-es/isNil'
import identity from 'lodash-es/identity'
import flatten from 'lodash-es/flatten'
import toInteger from 'lodash-es/toInteger'
import padStart from 'lodash-es/padStart'
import omit from 'lodash-es/omit'
import isEmpty from 'lodash-es/isEmpty'
import debounce from 'lodash-es/debounce'
import some from 'lodash-es/some'
import isNumber from 'lodash-es/isNumber'
import toNumber from 'lodash-es/toNumber'
import isNaN from 'lodash-es/isNaN'
import merge from 'lodash-es/merge'

export const isNumeric = (value) => {
  return isNumber(value) || (!isEmpty(value) && !isNaN(parseFloat(value)))
}

export const mergeAll = (...args: any[]) => reduce(args, extend)
export const omitNil = (obj) => pickBy(obj, identity)

export { isNil, flatten, reduce, toInteger, padStart, omit, isEmpty, debounce, some, isNumber, toNumber, pickBy, isNaN, merge }
