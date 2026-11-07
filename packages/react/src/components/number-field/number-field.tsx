/*
 * Third-party code under the Apache License 2.0; see THIRD-PARTY-NOTICES.txt in this package.
 * Modified by Kaladan: what a value its own checks refuse is said in the page's language, as a
 * tree's fields say it, not the browser's (use-text-validation.ts); digits typed are the page's as
 * they are typed.
 */
"use client";

import type {NumberFieldVariants} from "../../styles/recipes";
import type {ComponentPropsWithRef} from "react";

import {numberFieldVariants} from "../../styles/recipes";
import React, {createContext, use} from "react";
import {Button as ButtonPrimitive} from "react-aria-components/Button";
import {Group as GroupPrimitive} from "react-aria-components/Group";
import {Input as InputPrimitive} from "react-aria-components/Input";
import {NumberField as NumberFieldPrimitive} from "react-aria-components/NumberField";

import {useLocale} from "react-aria-components/I18nProvider";

import {composeTwRenderProps} from "../../utils/compose";
import {numberingSystemOf, toDigitsOf} from "../../utils/digits";
import {useNumberValidate} from "../textfield/use-text-validation";
import {IconMinus, IconPlus} from "../icons";

/* -------------------------------------------------------------------------------------------------
 * NumberField Context
 * -----------------------------------------------------------------------------------------------*/
type NumberFieldContext = {
  slots?: ReturnType<typeof numberFieldVariants>;
};

const NumberFieldContext = createContext<NumberFieldContext>({});

/* -------------------------------------------------------------------------------------------------
 * NumberField Root
 * -----------------------------------------------------------------------------------------------*/
interface NumberFieldRootProps
  extends ComponentPropsWithRef<typeof NumberFieldPrimitive>, NumberFieldVariants {}

const NumberFieldRoot = ({
  children,
  className,
  fullWidth,
  variant,
  ...props
}: NumberFieldRootProps) => {
  const slots = React.useMemo(
    () => numberFieldVariants({fullWidth, variant}),
    [fullWidth, variant],
  );
  const contextValue = React.useMemo(() => ({slots}), [slots]);
  const validate = useNumberValidate(props);

  return (
    <NumberFieldContext value={contextValue}>
      <NumberFieldPrimitive
        data-slot="number-field"
        {...props}
        validate={validate as any}
        className={composeTwRenderProps(className, slots?.base())}
      >
        {(values) => <>{typeof children === "function" ? children(values) : children}</>}
      </NumberFieldPrimitive>
    </NumberFieldContext>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NumberField Group
 * -----------------------------------------------------------------------------------------------*/
interface NumberFieldGroupProps extends ComponentPropsWithRef<typeof GroupPrimitive> {}

const NumberFieldGroup = ({children, className, ...props}: NumberFieldGroupProps) => {
  const {slots} = use(NumberFieldContext);

  return (
    <GroupPrimitive
      className={composeTwRenderProps(className, slots?.group())}
      data-slot="number-field-group"
      {...props}
    >
      {(values) => <>{typeof children === "function" ? children(values) : children}</>}
    </GroupPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NumberField Input
 * -----------------------------------------------------------------------------------------------*/
interface NumberFieldInputProps extends ComponentPropsWithRef<typeof InputPrimitive> {}

/** Sets an input's value through the property's own setter, which leaves React's record of it. */
const setInputValue = (input: HTMLInputElement, value: string) =>
  Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set?.call(input, value);

/*
 * Kaladan's: the digits typed are the page's as they are typed, and the decimal and group marks
 * with them: «۱۲۵۰» on a Persian page for 1250 typed, 1,250 on an English page for «۱٬۲۵۰». React
 * Aria keeps whichever digits were typed, so a Persian page showed "1,000" once the field was
 * left; and it refuses a keystroke whose digits differ from those already there, so «۱» then a
 * Latin 2 was lost. What is typed or pasted is turned before React Aria weighs it, and put in
 * where the caret is; anything that still arrives otherwise, such as the browser's autofill, is
 * turned as it lands, the caret kept. Both set the value through its own setter, so that React
 * still sees a change.
 */
const NumberFieldInput = ({className, onInputCapture, ref, ...props}: NumberFieldInputProps) => {
  const {slots} = use(NumberFieldContext);
  const {locale} = useLocale();
  const system = React.useMemo(() => numberingSystemOf(locale), [locale]);
  const own = React.useRef<HTMLInputElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLInputElement | null) => {
      own.current = node;
      if (typeof ref === "function") ref(node);
      else if (ref) (ref as React.RefObject<HTMLInputElement | null>).current = node;
    },
    [ref],
  );

  React.useEffect(() => {
    const input = own.current;

    if (!input) return;
    const onBeforeInput = (event: InputEvent) => {
      const typed = event.data;

      if (!typed || event.isComposing) return;
      const page = toDigitsOf(system, typed, true);

      if (page === typed) return;
      event.preventDefault();
      const {value} = input;
      const start = input.selectionStart ?? value.length;
      const end = input.selectionEnd ?? start;

      setInputValue(input, value.slice(0, start) + page + value.slice(end));
      input.setSelectionRange(start + page.length, start + page.length);
      input.dispatchEvent(new Event("input", {bubbles: true}));
    };

    // Capturing, so that it runs before React Aria's own check on the same input.
    input.addEventListener("beforeinput", onBeforeInput, {capture: true});

    return () => input.removeEventListener("beforeinput", onBeforeInput, {capture: true});
  }, [system]);

  return (
    <InputPrimitive
      ref={setRef}
      className={composeTwRenderProps(className, slots?.input())}
      data-slot="number-field-input"
      {...props}
      onInputCapture={(event) => {
        const input = event.currentTarget;
        const typed = input.value;
        const page = toDigitsOf(system, typed, true);

        if (page !== typed) {
          const {selectionEnd, selectionStart} = input;

          setInputValue(input, page);
          input.setSelectionRange(selectionStart, selectionEnd);
        }
        onInputCapture?.(event);
      }}
    />
  );
};

/* -------------------------------------------------------------------------------------------------
 * NumberField Increment Button
 * -----------------------------------------------------------------------------------------------*/
interface NumberFieldIncrementButtonProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}

const NumberFieldIncrementButton = ({
  children,
  className,
  ...props
}: NumberFieldIncrementButtonProps) => {
  const {slots} = use(NumberFieldContext);

  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, slots?.incrementButton())}
      data-slot="number-field-increment-button"
      slot="increment"
      {...props}
    >
      {children && React.isValidElement(children) ? (
        children
      ) : (
        <IconPlus data-slot="number-field-increment-button-icon" />
      )}
    </ButtonPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * NumberField Decrement Button
 * -----------------------------------------------------------------------------------------------*/
interface NumberFieldDecrementButtonProps extends ComponentPropsWithRef<typeof ButtonPrimitive> {}

const NumberFieldDecrementButton = ({
  children,
  className,
  ...props
}: NumberFieldDecrementButtonProps) => {
  const {slots} = use(NumberFieldContext);

  return (
    <ButtonPrimitive
      className={composeTwRenderProps(className, slots?.decrementButton())}
      data-slot="number-field-decrement-button"
      slot="decrement"
      {...props}
    >
      {children && React.isValidElement(children) ? (
        children
      ) : (
        <IconMinus data-slot="number-field-decrement-button-icon" />
      )}
    </ButtonPrimitive>
  );
};

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
export {
  NumberFieldRoot,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementButton,
  NumberFieldDecrementButton,
};

export type {
  NumberFieldRootProps,
  NumberFieldGroupProps,
  NumberFieldInputProps,
  NumberFieldIncrementButtonProps,
  NumberFieldDecrementButtonProps,
};
