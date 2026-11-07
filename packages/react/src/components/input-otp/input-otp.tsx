/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: holds its code in Latin digits and shows the page's, and is read as invalid
 * (see InputOTPRoot).
 */
"use client";

import type {InputOTPVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";
import type {ValidationResult} from "react-aria-components/CheckboxGroup";

import {inputOTPVariants} from "../../styles/recipes";
import {OTPInput, OTPInputContext} from "input-otp";
import React, {createContext, use} from "react";
import {FieldErrorContext} from "react-aria-components/FieldError";
import {useLocale} from "react-aria-components/I18nProvider";

import {dataAttr} from "../../utils/assertion";
import {composeSlotClassName} from "../../utils/compose";
import {useControlledState} from "../../utils/controlled-state";
import {numberingSystemOf, toDigitsOf, toLatinDigits} from "../../utils/digits";

const EMPTY_VALIDATION_ERRORS: string[] = [];

/* -------------------------------------------------------------------------------------------------
 * Input OTP Context
 * -----------------------------------------------------------------------------------------------*/
interface InputOTPContext {
  slots?: ReturnType<typeof inputOTPVariants>;
  isDisabled?: boolean;
  isInvalid?: boolean;
}

const InputOTPContext = createContext<InputOTPContext>({
  isDisabled: false,
  isInvalid: false,
});

/* -------------------------------------------------------------------------------------------------
 * Input OTP Root
 * -----------------------------------------------------------------------------------------------*/
interface InputOTPRootProps
  extends
    Omit<ComponentPropsWithRef<typeof OTPInput>, "disabled" | "containerClassName" | "render">,
    InputOTPVariants {
  isDisabled?: boolean;
  isInvalid?: boolean;
  validationErrors?: string[];
  validationDetails?: ValidityState;
  inputClassName?: string;
  children: React.ReactNode;
}

/*
 * Kaladan's: the code is held in Latin digits, whichever were typed or pasted, and its boxes show
 * the page's: a phone's Persian keyboard types «۴۸۲۹», a message may bring either, and a server
 * reads 4829. `value`, `defaultValue`, `onChange`, `onComplete` and the form's value are Latin;
 * `pattern` is matched against the Latin code, so `^\d+$` lets Persian digits in. The code is
 * always held here, never left to input-otp, which handed a `defaultValue` to its input beside
 * its own `value` and so drew React's warning. An invalid code is read as invalid
 * (`aria-invalid`), not only drawn so.
 */
const InputOTPRoot = ({
  children,
  className,
  defaultValue,
  inputClassName,
  isDisabled = false,
  isInvalid = false,
  name,
  onChange,
  onComplete,
  pattern,
  validationDetails,
  validationErrors = EMPTY_VALIDATION_ERRORS,
  value,
  variant,
  ...props
}: InputOTPRootProps) => {
  const slots = React.useMemo(() => inputOTPVariants({variant}), [variant]);
  const {locale} = useLocale();
  const system = React.useMemo(() => numberingSystemOf(locale), [locale]);
  const [code, setCode] = useControlledState(
    value === undefined ? undefined : toLatinDigits(String(value)),
    toLatinDigits(String(defaultValue ?? "")),
    onChange as ((value: string) => void) | undefined,
  );
  const accepts = React.useMemo(() => {
    if (!pattern) return () => true;
    try {
      const rule = new RegExp(pattern);

      return (latin: string) => latin.length === 0 || rule.test(latin);
    } catch {
      return () => true;
    }
  }, [pattern]);

  const validation = React.useMemo(
    () =>
      ({
        isInvalid,
        validationErrors,
        validationDetails,
      }) as ValidationResult,
    [isInvalid, validationErrors, validationDetails],
  );
  const contextValue = React.useMemo(
    () => ({slots, isDisabled, isInvalid}),
    [slots, isDisabled, isInvalid],
  );

  return (
    <InputOTPContext value={contextValue}>
      <FieldErrorContext value={validation}>
        <OTPInput
          // OTP Input package uses the `className` prop for the actual `input` element which is not visible to the user so no need to pass it to the base container
          aria-invalid={isInvalid || undefined}
          className={slots.input({className: inputClassName})}
          containerClassName={slots.base({className})}
          data-disabled={dataAttr(isDisabled)}
          data-invalid={dataAttr(isInvalid)}
          data-slot="input-otp"
          disabled={isDisabled}
          {...props}
          value={toDigitsOf(system, code)}
          onChange={(typed: string) => {
            const latin = toLatinDigits(typed);

            if (accepts(latin)) setCode(latin);
          }}
          onComplete={(typed: string) => onComplete?.(toLatinDigits(typed))}
        >
          {children}
          {name ? <input disabled={isDisabled} name={name} type="hidden" value={code} /> : null}
        </OTPInput>
      </FieldErrorContext>
    </InputOTPContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Input OTP Group
 * -----------------------------------------------------------------------------------------------*/

interface InputOTPGroupProps extends ComponentPropsWithRef<"div"> {}

const InputOTPGroup = ({className, ...props}: InputOTPGroupProps) => {
  const {slots} = use(InputOTPContext);

  return (
    <div
      className={composeSlotClassName(slots?.group, className)}
      data-slot="input-otp-group"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Input OTP Slot
 * -----------------------------------------------------------------------------------------------*/
interface InputOTPSlotProps extends ComponentPropsWithRef<"div"> {
  index: number;
}

const InputOTPSlot = ({className, index, ...props}: InputOTPSlotProps) => {
  const {isDisabled, isInvalid, slots} = use(InputOTPContext);

  const inputOTPContext = use(OTPInputContext);
  const {char, hasFakeCaret, isActive} = inputOTPContext?.slots[index] ?? {};

  return (
    <div
      {...props}
      className={composeSlotClassName(slots?.slot, className)}
      data-active={dataAttr(isActive)}
      data-disabled={dataAttr(isDisabled)}
      data-filled={dataAttr(!!char)}
      data-invalid={dataAttr(isInvalid)}
      data-slot="input-otp-slot"
    >
      {char ? (
        <div className={slots?.slotValue()} data-slot="input-otp-slot-value">
          {char}
        </div>
      ) : null}
      {hasFakeCaret && isActive ? (
        <div className={slots?.caret()} data-slot="input-otp-caret" />
      ) : null}
    </div>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Input OTP Separator
 * -----------------------------------------------------------------------------------------------*/
interface InputOTPSeparatorProps extends ComponentPropsWithRef<"div"> {
  className?: string;
}

const InputOTPSeparator = ({className, ...props}: InputOTPSeparatorProps) => {
  const {slots} = use(InputOTPContext);

  return (
    <div
      className={composeSlotClassName(slots?.separator, className)}
      data-slot="input-otp-separator"
      {...props}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {InputOTPRoot, InputOTPGroup, InputOTPSlot, InputOTPSeparator};

export type {InputOTPRootProps, InputOTPGroupProps, InputOTPSlotProps, InputOTPSeparatorProps};
