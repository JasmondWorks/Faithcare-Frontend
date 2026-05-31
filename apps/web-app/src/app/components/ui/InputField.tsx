import * as React from "react";
import type { Control, ControllerRenderProps, FieldValues } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./form";
import { Input } from "./input";
import { Textarea } from "./textarea";
import { Checkbox } from "./checkbox";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "./input-otp";
import SearchableSelect from "./SearchableSelect";
import { MultiSelect } from "./MultiSelect";
import { CardMultiSelect } from "./CardMultiSelect";
import { PhoneInput } from "./PhoneInput";
import { MinimalistEditor } from "./MinimalistEditor";
import { RichTextEditor } from "./RichTextEditor";
import { Eye, EyeOff, ChevronDown, Check, Calendar as CalendarIcon, Clock } from "lucide-react";
import { cn } from "./utils";
import { Button } from "@/components/ui/button";
import { Label } from "./label";
import { Popover, PopoverContent, PopoverTrigger } from "./popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./command";
import { Calendar } from "./calendar";
import { format } from "date-fns";

export type InputFieldType =
  | "text"
  | "email"
  | "password"
  | "number"
  | "textarea"
  | "searchable-select"
  | "select"
  | "file"
  | "checkbox"
  | "otp"
  | "radio-group"
  | "multi-select"
  | "card-multi-select"
  | "phone"
  | "document"
  | "rich-text"
  | "date"
  | "time"
  | "date-range"
  | "custom";

export interface InputFieldProps extends Omit<React.ComponentProps<"input">, "type" | "onChange" | "value" | "name" | "ref" | "children"> {
  // react-hook-form's Control is invariant in its field-values type, so there
  // is no non-`any` supertype that accepts every caller's concrete Control.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  control?: Control<any>;
  name: string;
  label?: React.ReactNode;
  placeholder?: string;
  type?: InputFieldType;
  icon?: React.ReactElement | React.ElementType; // Accepting the icon component
  iconPosition?: "left" | "right";
  description?: React.ReactNode;
  disabled?: boolean;
  className?: string;
  inputClassName?: string;
  labelClassName?: string;

  // Standard React / Non-hook-form props
  value?: unknown;
  onChange?: (e: { target: { name: string; value: unknown } }) => void;
  onBlur?: (e: React.FocusEvent) => void;
  error?: string;

  // Select / Radio Group Props
  options?: { label: string; value: string }[];

  // Searchable Select Props
  searchableOptions?: unknown[];
  getDisplayValue?: (item: unknown) => React.ReactNode;
  getStringValue?: (item: unknown) => string;
  onSearch?: (searchTerm: string) => void;

  // OTP Props
  otpLength?: number;

  // Custom Props
  children?:
    | React.ReactNode
    | ((field: ControllerRenderProps<FieldValues, string>) => React.ReactNode);
}

export const InputField = React.forwardRef<HTMLElement, InputFieldProps>(
  (
    {
      control,
      name,
      label,
      placeholder,
      type = "text",
      icon,
      iconPosition = "left",
      description,
      disabled,
      className,
      inputClassName,
      labelClassName,
      value,
      onChange,
      onBlur,
      error,
      options = [],
      searchableOptions = [],
      getDisplayValue,
      getStringValue,
      onSearch,
      otpLength = 6,
      children,
      ...restProps
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [search, setSearch] = React.useState("");
    const [open, setOpen] = React.useState(false);

    const renderFieldContent = (
      field: ControllerRenderProps<FieldValues, string>,
    ) => {
      const useForm = !!control;
      const ControlWrapper = useForm ? FormControl : React.Fragment;
      // The same ref is forwarded to several different element types
      // (input, textarea, button, div, ...). Ref<never> is assignable to
      // every concrete Ref<HTMLElement>, so it satisfies all call sites.
      const mergedRef = (field.ref || ref) as React.Ref<never>;

      switch (type) {
        case "text":
        case "email":
        case "number":
        case "password": {
          const isPassword = type === "password";
          return (
            <div className="relative group">
              {icon && (
                <div
                  className={cn(
                    "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors flex items-center justify-center z-10",
                    iconPosition === "left" ? "left-4.5" : "right-4.5",
                  )}
                >
                  {React.isValidElement(icon)
                    ? icon
                    : React.createElement(icon as React.ElementType, {
                        className: "w-4 h-4",
                        strokeWidth: 1.5,
                      })}
                </div>
              )}
              <ControlWrapper>
                <Input
                  type={
                    isPassword ? (showPassword ? "text" : "password") : type
                  }
                  placeholder={placeholder}
                  disabled={disabled}
                  className={cn(
                    "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg",
                    icon && iconPosition === "left" ? "pl-12" : "pl-6",
                    isPassword || (icon && iconPosition === "right")
                      ? "pr-12"
                      : "pr-6",
                    inputClassName,
                  )}
                  {...restProps}
                  {...field}
                  ref={mergedRef}
                  value={field.value ?? ""}
                  onChange={(e) => {
                    const val =
                      type === "number"
                        ? e.target.value === ""
                          ? ""
                          : Number(e.target.value)
                        : e.target.value;
                    field.onChange(val);
                  }}
                />
              </ControlWrapper>
              {isPassword && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none h-8 w-8"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </Button>
              )}
            </div>
          );
        }

        case "time":
          return (
            <div className="relative group">
              <div
                className={cn(
                  "absolute top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors flex items-center justify-center z-10",
                  iconPosition === "left" ? "left-4.5" : "right-4.5",
                )}
              >
                {icon ? (
                  React.isValidElement(icon) ? (
                    icon
                  ) : (
                    React.createElement(icon as React.ElementType, {
                      className: "w-4 h-4",
                      strokeWidth: 1.5,
                    })
                  )
                ) : (
                  <Clock className="w-4 h-4" />
                )}
              </div>
              <ControlWrapper>
                <Input
                  type="time"
                  disabled={disabled}
                  className={cn(
                    "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg",
                    (!icon || iconPosition === "left") ? "pl-12" : "pl-6",
                    (icon && iconPosition === "right") ? "pr-12" : "pr-6",
                    inputClassName,
                  )}
                  {...restProps}
                  {...field}
                  ref={mergedRef}
                  value={field.value ?? ""}
                />
              </ControlWrapper>
            </div>
          );

        case "textarea":
          return (
            <ControlWrapper>
              <Textarea
                placeholder={placeholder}
                disabled={disabled}
                className={cn(
                  "w-full bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg min-h-[100px]",
                  inputClassName,
                )}
                {...field}
                ref={mergedRef}
                value={field.value ?? ""}
              />
            </ControlWrapper>
          );

        case "checkbox":
          return (
            <div className="flex items-center gap-2">
              <ControlWrapper>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={disabled}
                  className={inputClassName}
                  ref={mergedRef}
                />
              </ControlWrapper>
              {label &&
                (useForm ? (
                  <FormLabel className="text-sm font-medium cursor-pointer m-0 leading-none">
                    {label}
                  </FormLabel>
                ) : (
                  <Label
                    className="text-sm font-medium cursor-pointer m-0 leading-none"
                    htmlFor={name}
                  >
                    {label}
                  </Label>
                ))}
            </div>
          );

        case "otp":
          return (
            <InputOTP
              maxLength={otpLength}
              value={field.value}
              onChange={field.onChange}
              disabled={disabled}
              className={inputClassName}
              ref={mergedRef}
            >
              <InputOTPGroup>
                {Array.from({ length: otpLength }).map((_, i) => (
                  <InputOTPSlot
                    key={i}
                    index={i}
                    className="w-12 h-[52px] text-xl rounded-lg border-border bg-secondary/30"
                  />
                ))}
              </InputOTPGroup>
            </InputOTP>
          );

        case "select":
          return (
            <Popover
              open={open}
              onOpenChange={(newOpen) => {
                setOpen(newOpen);
                if (!newOpen) setSearch("");
              }}
            >
              <ControlWrapper>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    disabled={disabled}
                    className={cn(
                      "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg transition-all text-foreground font-medium tracking-tight text-lg pl-6 py-3 justify-between hover:bg-secondary/40",
                      !field.value && "text-muted-foreground font-normal",
                      inputClassName,
                    )}
                    ref={mergedRef}
                  >
                    {field.value
                      ? options.find((option) => option.value === field.value)
                          ?.label
                      : placeholder}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
              </ControlWrapper>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput
                    placeholder="Search..."
                    value={search}
                    onValueChange={setSearch}
                  />
                  <CommandList className="max-h-[300px] overflow-y-auto">
                    <CommandEmpty>No result found.</CommandEmpty>
                    <CommandGroup>
                      {options
                        .filter((option) =>
                          option.label
                            .toLowerCase()
                            .includes(search.toLowerCase()),
                        )
                        .map((option) => (
                          <CommandItem
                            key={option.value}
                            value={option.value}
                            onSelect={() => {
                              field.onChange(option.value);
                              setSearch("");
                              setOpen(false);
                            }}
                            className={cn(
                              "flex items-center gap-2 px-3 py-2 text-sm cursor-pointer transition-colors",
                              field.value === option.value
                                ? "bg-neutral-100 font-semibold text-foreground"
                                : "hover:bg-neutral-50 text-foreground/80 hover:text-foreground",
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4 text-accent",
                                field.value === option.value
                                  ? "opacity-100"
                                  : "opacity-0",
                              )}
                            />
                            {option.label}
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          );

        case "searchable-select":
          return (
            <SearchableSelect
              placeholder={placeholder}
              options={searchableOptions}
              onSelect={field.onChange}
              selectedItem={field.value}
              getDisplayValue={getDisplayValue!}
              getStringValue={getStringValue}
              onSearch={onSearch}
              inputClassName={cn(
                "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg pl-6",
                inputClassName,
              )}
            />
          );

        case "radio-group":
          return (
            <RadioGroup
              onValueChange={field.onChange}
              defaultValue={field.value}
              className={cn("flex flex-col space-y-1", inputClassName)}
              disabled={disabled}
              ref={mergedRef}
            >
              {options.map((option) => (
                <div
                  className="flex items-center space-x-3 space-y-0"
                  key={option.value}
                >
                  <ControlWrapper>
                    <RadioGroupItem value={option.value} />
                  </ControlWrapper>
                  {useForm ? (
                    <FormLabel className="font-normal cursor-pointer">
                      {option.label}
                    </FormLabel>
                  ) : (
                    <Label className="font-normal cursor-pointer">
                      {option.label}
                    </Label>
                  )}
                </div>
              ))}
            </RadioGroup>
          );

        case "multi-select":
          return (
            <MultiSelect
              options={options}
              selected={field.value || []}
              onChange={field.onChange}
              placeholder={placeholder}
              className={cn(
                "w-full min-h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-within:ring-4 focus-within:ring-accent/5 focus-within:border-accent transition-all text-foreground font-medium tracking-tight text-lg",
                inputClassName,
              )}
            />
          );

        case "card-multi-select":
          return (
            <CardMultiSelect
              options={options}
              value={field.value || []}
              onChange={field.onChange}
              disabled={disabled}
              className={inputClassName}
            />
          );

        case "phone":
          return (
            <ControlWrapper>
              <PhoneInput
                {...field}
                placeholder={placeholder}
                disabled={disabled}
                className={inputClassName}
                ref={mergedRef}
              />
            </ControlWrapper>
          );

        case "file":
          return (
            <ControlWrapper>
              <Input
                type="file"
                disabled={disabled}
                className={cn(
                  "file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-accent file:text-accent-foreground hover:file:bg-accent/90 py-3 h-auto cursor-pointer",
                  inputClassName,
                )}
                onChange={(e) => field.onChange(e.target.files)}
                onBlur={field.onBlur}
                name={field.name}
                ref={mergedRef}
              />
            </ControlWrapper>
          );

        case "document":
          return (
            <ControlWrapper>
              <MinimalistEditor
                placeholder={placeholder}
                disabled={disabled}
                className={cn("min-h-[200px]", inputClassName)}
                {...field}
                ref={mergedRef}
                value={field.value ?? ""}
              />
            </ControlWrapper>
          );

        case "rich-text":
          return (
            <ControlWrapper>
              <RichTextEditor
                placeholder={placeholder}
                className={cn("min-h-[350px]", inputClassName)}
                {...field}
                value={field.value ?? ""}
              />
            </ControlWrapper>
          );

        case "date":
          return (
            <Popover>
              <PopoverTrigger asChild>
                <ControlWrapper>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg justify-start text-left font-normal px-4",
                      !field.value && "text-muted-foreground",
                      inputClassName,
                    )}
                    disabled={disabled}
                    ref={mergedRef}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value ? format(field.value, "PPP") : <span>{placeholder || "Pick a date"}</span>}
                  </Button>
                </ControlWrapper>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={field.value}
                  onSelect={field.onChange}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          );

        case "date-range":
          return (
            <div className={cn("grid gap-2", inputClassName)}>
              <Popover>
                <PopoverTrigger asChild>
                  <ControlWrapper>
                    <Button
                      id="date"
                      variant={"outline"}
                      className={cn(
                        "w-full h-[52px] bg-secondary/30 border border-neutral-200 rounded-lg focus-visible:ring-4 focus-visible:ring-accent/5 focus-visible:border-accent transition-all text-foreground font-medium tracking-tight text-lg justify-start text-left font-normal px-4",
                        !field.value && "text-muted-foreground",
                      )}
                      disabled={disabled}
                      ref={mergedRef}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {field.value?.from ? (
                        field.value.to ? (
                          <>
                            {format(field.value.from, "LLL dd, y")} -{" "}
                            {format(field.value.to, "LLL dd, y")}
                          </>
                        ) : (
                          format(field.value.from, "LLL dd, y")
                        )
                      ) : (
                        <span>{placeholder || "Pick a date range"}</span>
                      )}
                    </Button>
                  </ControlWrapper>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    initialFocus
                    mode="range"
                    defaultMonth={field.value?.from}
                    selected={field.value}
                    onSelect={field.onChange}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          );

        case "custom":
          if (typeof children === "function") {
            return children(field);
          }
          return <ControlWrapper>{children}</ControlWrapper>;

        default:
          return null;
      }
    };

    if (control) {
      return (
        <FormField
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem className={cn("w-full gap-2", className)}>
              {type !== "checkbox" && label && (
                <FormLabel
                  className={cn(
                    "text-sm font-medium text-muted-foreground ml-1",
                    labelClassName,
                  )}
                >
                  {label}
                </FormLabel>
              )}

              {renderFieldContent(field)}

              {description && (
                <FormDescription className="text-sm font-medium text-muted-foreground/50 italic ml-1">
                  {description}
                </FormDescription>
              )}
              <FormMessage className="ml-1" />
            </FormItem>
          )}
        />
      );
    }

    // Standalone version
    const standaloneField = {
      name,
      value,
      onChange: (val: unknown) => {
        if (onChange) {
          // If it looks like an event, pass it through, otherwise mock it
          if (val && typeof val === "object" && "target" in val) {
            onChange(val as { target: { name: string; value: unknown } });
          } else {
            onChange({ target: { name, value: val } });
          }
        }
      },
      onBlur: (e: React.FocusEvent) => onBlur?.(e),
      ref: ref,
    } as unknown as ControllerRenderProps<FieldValues, string>;

    return (
      <div className={cn("w-full grid gap-2", className)}>
        {type !== "checkbox" && label && (
          <Label
            className={cn(
              "text-sm font-medium text-muted-foreground ml-1",
              labelClassName,
            )}
            htmlFor={name}
          >
            {label}
          </Label>
        )}

        {renderFieldContent(standaloneField)}

        {description && (
          <p className="text-sm font-medium text-muted-foreground/50 italic ml-1">
            {description}
          </p>
        )}
        {error && <p className="text-destructive text-sm ml-1">{error}</p>}
      </div>
    );
  },
);

InputField.displayName = "InputField";
