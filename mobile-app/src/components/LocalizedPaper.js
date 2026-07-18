import React from 'react';
import { StyleSheet } from 'react-native';
// Use Paper's module entry directly because its production Babel optimizer only
// supports named imports and cannot transform the namespace required by this adapter.
import * as Paper from 'react-native-paper/lib/module/index';
import { useLanguage } from '../contexts/LanguageContext';

const {
  ActivityIndicator,
  Avatar,
  Card,
  Divider,
  IconButton,
  Portal,
  ProgressBar,
  Surface,
  Switch,
  TouchableRipple,
} = Paper;

export {
  ActivityIndicator,
  Avatar,
  Card,
  Divider,
  IconButton,
  Portal,
  ProgressBar,
  Surface,
  Switch,
  TouchableRipple,
};

const translateNode = (node, t) => {
  if (typeof node !== 'string') return node;
  const leading = node.match(/^\s*/)?.[0] || '';
  const trailing = node.match(/\s*$/)?.[0] || '';
  const value = node.trim();
  if (!value) return node;

  let translated = t(value);
  if (translated === value) {
    const punctuation = value.match(/^(.*?)([:：…]+)$/);
    if (punctuation) {
      const base = punctuation[1].trim();
      const localizedBase = t(base);
      if (localizedBase !== base) translated = `${localizedBase}${punctuation[2]}`;
    }
  }
  return `${leading}${translated}${trailing}`;
};

const localizeChildren = (children, t) => React.Children.map(children, child => {
  if (typeof child === 'string') return translateNode(child, t);
  return child;
});

const containsNumber = children => {
  let found = false;
  React.Children.forEach(children, child => {
    if (typeof child === 'number' || (typeof child === 'string' && /\d/.test(child))) found = true;
  });
  return found;
};

const readableEnglishStyle = (style, language, children) => {
  if (language !== 'en') return style;
  if (containsNumber(children)) return [style, { fontWeight: '500' }];

  const weight = StyleSheet.flatten(style)?.fontWeight;
  const numericWeight = weight === 'bold' ? 700 : Number.parseInt(String(weight), 10);
  return numericWeight > 600 ? [style, { fontWeight: '600' }] : style;
};

export const Text = React.forwardRef(({ children, style, ...props }, ref) => {
  const { t, isRTL, fontFamily, language } = useLanguage();
  return (
    <Paper.Text
      ref={ref}
      {...props}
      style={[
        { fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' },
        readableEnglishStyle(style, language, children),
      ]}
    >
      {localizeChildren(children, t)}
    </Paper.Text>
  );
});

export const Button = React.forwardRef(({ children, labelStyle, contentStyle, ...props }, ref) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.Button
      ref={ref}
      {...props}
      contentStyle={[isRTL && { flexDirection: 'row-reverse' }, contentStyle]}
      labelStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' }, labelStyle]}
    >
      {localizeChildren(children, t)}
    </Paper.Button>
  );
});

export const HelperText = React.forwardRef(({ children, style, ...props }, ref) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.HelperText
      ref={ref}
      {...props}
      style={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, style]}
    >
      {localizeChildren(children, t)}
    </Paper.HelperText>
  );
});

export const TextInput = React.forwardRef(({ label, placeholder, style, contentStyle, ...props }, ref) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.TextInput
      ref={ref}
      {...props}
      label={typeof label === 'string' ? t(label) : label}
      placeholder={typeof placeholder === 'string' ? t(placeholder) : placeholder}
      style={style}
      textAlign={isRTL ? 'right' : 'left'}
      contentStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, contentStyle]}
    />
  );
});
TextInput.Icon = Paper.TextInput.Icon;
TextInput.Affix = Paper.TextInput.Affix;

export const Searchbar = React.forwardRef(({ placeholder, inputStyle, ...props }, ref) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.Searchbar
      ref={ref}
      {...props}
      placeholder={typeof placeholder === 'string' ? t(placeholder) : placeholder}
      inputStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, inputStyle]}
    />
  );
});

export const FAB = React.forwardRef(({ label, ...props }, ref) => {
  const { t } = useLanguage();
  return <Paper.FAB ref={ref} {...props} label={typeof label === 'string' ? t(label) : label} />;
});

export const Chip = React.forwardRef(({ children, textStyle, ...props }, ref) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.Chip ref={ref} {...props} textStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr' }, textStyle]}>
      {localizeChildren(children, t)}
    </Paper.Chip>
  );
});

export const SegmentedButtons = ({ buttons = [], ...props }) => {
  const { t } = useLanguage();
  return <Paper.SegmentedButtons {...props} buttons={buttons.map(button => ({ ...button, label: typeof button.label === 'string' ? t(button.label) : button.label }))} />;
};

export const Snackbar = ({ children, ...props }) => {
  const { t } = useLanguage();
  return <Paper.Snackbar {...props}>{localizeChildren(children, t)}</Paper.Snackbar>;
};

const DialogTitle = ({ children, style, ...props }) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.Dialog.Title
      {...props}
      style={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, style]}
    >
      {localizeChildren(children, t)}
    </Paper.Dialog.Title>
  );
};

const DialogRoot = ({ style, ...props }) => {
  const { isRTL } = useLanguage();
  return <Paper.Dialog {...props} style={[{ direction: isRTL ? 'rtl' : 'ltr' }, style]} />;
};
DialogRoot.Title = DialogTitle;
DialogRoot.Content = Paper.Dialog.Content;
DialogRoot.Actions = Paper.Dialog.Actions;
DialogRoot.ScrollArea = Paper.Dialog.ScrollArea;
DialogRoot.Icon = Paper.Dialog.Icon;
export const Dialog = DialogRoot;

const MenuItem = ({ title, titleStyle, ...props }) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.Menu.Item
      {...props}
      title={typeof title === 'string' ? t(title) : title}
      titleStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, titleStyle]}
    />
  );
};

const MenuRoot = ({ contentStyle, ...props }) => {
  const { isRTL } = useLanguage();
  return <Paper.Menu {...props} contentStyle={[{ direction: isRTL ? 'rtl' : 'ltr' }, contentStyle]} />;
};
MenuRoot.Item = MenuItem;
export const Menu = MenuRoot;

const RadioButtonItem = ({ label, labelStyle, ...props }) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.RadioButton.Item
      {...props}
      label={typeof label === 'string' ? t(label) : label}
      labelStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, labelStyle]}
    />
  );
};

const RadioButtonRoot = props => <Paper.RadioButton {...props} />;
RadioButtonRoot.Item = RadioButtonItem;
RadioButtonRoot.Group = Paper.RadioButton.Group;
RadioButtonRoot.Android = Paper.RadioButton.Android;
RadioButtonRoot.IOS = Paper.RadioButton.IOS;
export const RadioButton = RadioButtonRoot;

const AppbarContent = ({ title, subtitle, titleStyle, ...props }) => {
  const { t, isRTL, fontFamily } = useLanguage();
  return (
    <Paper.Appbar.Content
      {...props}
      title={typeof title === 'string' ? t(title) : title}
      subtitle={typeof subtitle === 'string' ? t(subtitle) : subtitle}
      titleStyle={[{ fontFamily, writingDirection: isRTL ? 'rtl' : 'ltr', textAlign: isRTL ? 'right' : 'left' }, titleStyle]}
    />
  );
};

const AppbarRoot = props => <Paper.Appbar {...props} />;
const AppbarHeader = ({ style, ...props }) => {
  const { isRTL } = useLanguage();
  return <Paper.Appbar.Header {...props} style={[{ direction: isRTL ? 'rtl' : 'ltr' }, style]} />;
};
AppbarRoot.Action = Paper.Appbar.Action;
AppbarRoot.BackAction = Paper.Appbar.BackAction;
AppbarRoot.Content = AppbarContent;
AppbarRoot.Header = AppbarHeader;
export const Appbar = AppbarRoot;
