/// Sample trees for every block in groups 1–6 of the schema.
///
/// Every tree here is what a third-party app could send: plain data, the
/// spec's prop names, nothing Flutter-specific. The same trees, rendered by
/// the React side, should look like the admin.
library;

typedef Tree = Map<String, Object?>;

class Sample {
  const Sample(this.id, this.title, this.tree, {this.note});

  final String id;
  final String title;
  final Tree tree;

  /// What to look at, for the screenshot reader.
  final String? note;
}

class SampleGroup {
  const SampleGroup(this.id, this.title, this.samples);

  final String id;
  final String title;
  final List<Sample> samples;
}

Map<String, Object?> _set(String key) => {'do': 'setState', 'key': key};
Map<String, Object?> _call(String action, [List<String> keys = const []]) => {
  'do': 'call',
  'action': action,
  if (keys.isNotEmpty) 'with': keys,
};

Tree _stack(List<Tree> children, {bool row = false, int gap = 3}) => {
  'type': 'Stack',
  'props': {
    'direction': row ? 'horizontal' : 'vertical',
    'gap': gap,
    if (row) 'wrap': true,
    if (row) 'align': 'center',
  },
  'children': children,
};

Tree _text(String text, {String? tone, String? size}) => {
  'type': 'Text',
  'props': {'tone': ?tone, 'size': ?size},
  'children': text,
};

Tree _button(
  String text, {
  Map<String, Object?> props = const {},
  Object? onPress,
}) => {
  'type': 'Button',
  'props': props,
  'children': text,
  if (onPress != null) 'actions': {'onPress': onPress},
};

Tree _item(String id, String text, {Map<String, Object?> props = const {}}) => {
  'type': 'ListBoxItem',
  'props': {'id': id, ...props},
  'children': text,
};

/// The gallery's content, in Persian when [fa], else English.
List<SampleGroup> galleryGroups(bool fa) {
  String t(String persian, String english) => fa ? persian : english;

  return [
    // ------------------------------------------------------------------ 1
    SampleGroup('actions', t('۱ · کنش‌ها', '1 · Actions'), [
      Sample(
        'button-variants',
        'Button · variant',
        _stack(row: true, [
          for (final v in [
            'primary',
            'secondary',
            'tertiary',
            'outline',
            'ghost',
            'danger',
            'danger-soft',
          ])
            _button(v, props: {'variant': v}),
        ]),
        note: t(
          'هفت گونه روی چهار دکمهٔ متریال',
          'seven variants on four Material buttons',
        ),
      ),
      Sample(
        'button-sizes',
        'Button · size, icon, iconPlacement, isIconOnly, isPending',
        _stack([
          _stack(row: true, [
            _button(
              t('کوچک', 'Small'),
              props: {'size': 'sm', 'variant': 'primary'},
            ),
            _button(
              t('متوسط', 'Medium'),
              props: {'size': 'md', 'variant': 'primary'},
            ),
            _button(
              t('بزرگ', 'Large'),
              props: {'size': 'lg', 'variant': 'primary'},
            ),
          ]),
          _stack(row: true, [
            _button(
              t('افزودن', 'Add'),
              props: {'icon': 'plus', 'variant': 'primary'},
            ),
            // Named in left-to-right terms: arrow-right is "forward", and the
            // icon list mirrors it under right-to-left.
            _button(
              t('بعدی', 'Next'),
              props: {'icon': 'arrow-right', 'iconPlacement': 'end'},
            ),
            _button(
              '',
              props: {
                'icon': 'pencil',
                'isIconOnly': true,
                'label': t('ویرایش', 'Edit'),
              },
            ),
            _button(
              '',
              props: {
                'icon': 'trash-2',
                'isIconOnly': true,
                'variant': 'danger-soft',
                'label': t('حذف', 'Delete'),
              },
            ),
            _button(
              t('در حال ذخیره', 'Saving'),
              props: {'isPending': true, 'variant': 'primary'},
            ),
            _button(t('غیرفعال', 'Disabled'), props: {'isDisabled': true}),
          ]),
          _button(
            t('ادامهٔ پرداخت', 'Continue to payment'),
            props: {'fullWidth': true, 'variant': 'primary', 'size': 'md'},
          ),
        ]),
      ),
      Sample(
        'linkbutton-link',
        'LinkButton · Link',
        _stack([
          _stack(row: true, [
            {
              'type': 'LinkButton',
              'props': {
                'href': '/orders/DB-1041',
                'variant': 'outline',
                'icon': 'external-link',
              },
              'children': t('دیدن سفارش', 'View order'),
            },
            {
              'type': 'LinkButton',
              'props': {
                'href': 'https://kaladan.shop/help',
                'isExternal': true,
                'variant': 'ghost',
              },
              'children': t('راهنمای کالادان', 'Kaladan help'),
            },
          ]),
          {
            'type': 'Link',
            'props': {'href': '/settings/shipping'},
            'children': t('تنظیمات ارسال', 'Shipping settings'),
          },
          {
            'type': 'Link',
            'props': {'href': '/x', 'isDisabled': true},
            'children': t('پیوند غیرفعال', 'Disabled link'),
          },
        ]),
      ),
      Sample(
        'toggle-group',
        'ToggleButtonGroup · ToggleButton',
        _stack([
          {
            'type': 'ToggleButtonGroup',
            'props': {
              'label': t('بازهٔ گزارش', 'Report span'),
              'name': 'span',
              'isDetached': false,
              'defaultSelectedKeys': ['week'],
            },
            'actions': {'onSelectionChange': _set('span')},
            'children': [
              {
                'type': 'ToggleButton',
                'props': {'id': 'day'},
                'children': t('روز', 'Day'),
              },
              {
                'type': 'ToggleButton',
                'props': {'id': 'week'},
                'children': t('هفته', 'Week'),
              },
              {
                'type': 'ToggleButton',
                'props': {'id': 'month'},
                'children': t('ماه', 'Month'),
              },
            ],
          },
          {
            'type': 'ToggleButtonGroup',
            'props': {
              'label': t('وضعیت پرداخت', 'Payment status'),
              'isLabelHidden': false,
              'selectionMode': 'multiple',
              'disallowEmptySelection': false,
            },
            'children': [
              {
                'type': 'ToggleButton',
                'props': {'id': 'paid', 'icon': 'circle-check'},
                'children': t('پرداخت‌شده', 'Paid'),
              },
              {
                'type': 'ToggleButton',
                'props': {'id': 'unpaid'},
                'children': t('پرداخت‌نشده', 'Unpaid'),
              },
              {
                'type': 'ToggleButton',
                'props': {'id': 'refunded', 'isDisabled': true},
                'children': t('بازپرداخت', 'Refunded'),
              },
            ],
          },
          {
            'type': 'ToggleButtonGroup',
            'props': {
              'label': t('قلم', 'Text style'),
              'isDetached': false,
              'defaultSelectedKeys': ['bold'],
            },
            'children': [
              {
                'type': 'ToggleButton',
                'props': {
                  'id': 'bold',
                  'icon': 'bold',
                  'isIconOnly': true,
                  'label': t('پررنگ', 'Bold'),
                },
              },
              {
                'type': 'ToggleButton',
                'props': {
                  'id': 'italic',
                  'icon': 'italic',
                  'isIconOnly': true,
                  'label': t('کج', 'Italic'),
                },
              },
              {
                'type': 'ToggleButton',
                'props': {
                  'id': 'underline',
                  'icon': 'underline',
                  'isIconOnly': true,
                  'label': t('زیرخط', 'Underline'),
                },
              },
            ],
          },
        ]),
      ),
    ]),

    // ------------------------------------------------------------------ 2
    SampleGroup('fields', t('۲ · فیلدهای متن', '2 · Text fields'), [
      Sample(
        'textfield',
        'TextField',
        _stack([
          {
            'type': 'TextField',
            'props': {
              'label': t('نام محصول', 'Product name'),
              'defaultValue': t('شال ابریشمی', 'Silk scarf'),
              'description': t(
                'همان‌طور که در فروشگاه دیده می‌شود.',
                'As shown in the store.',
              ),
              'isRequired': true,
              'maxLength': 60,
            },
            'actions': {'onChange': _set('name')},
          },
          {
            'type': 'TextField',
            'props': {
              'label': t('ایمیل', 'Email'),
              'type': 'email',
              'defaultValue': 'not-an-email',
              'errorMessage': t(
                'نشانی ایمیل درست نیست.',
                'Enter a valid email address.',
              ),
              'autoComplete': 'email',
            },
          },
          {
            'type': 'TextField',
            'props': {
              'label': t('قیمت', 'Price'),
              'inputMode': 'numeric',
              'suffix': t('تومان', 'Toman'),
              'placeholder': '0',
            },
          },
          {
            'type': 'TextField',
            'props': {
              'label': t('شناسهٔ کالا (SKU)', 'SKU'),
              'dir': 'ltr',
              'prefix': 'SKU-',
              'defaultValue': 'SCARF-07',
              'autoCapitalize': 'characters',
              'spellCheck': false,
              'variant': 'secondary',
            },
          },
          {
            'type': 'TextField',
            'props': {
              'label': t('کد پیگیری (از سرور)', 'Tracking code (pinned)'),
              'value': 'DB-1041',
              'isReadOnly': true,
            },
          },
          {
            'type': 'TextField',
            'props': {
              'label': t('رمز', 'Password'),
              'type': 'password',
              'autoComplete': 'new-password',
              'minLength': 8,
              'fullWidth': false,
            },
          },
          {
            'type': 'TextField',
            'props': {
              'label': t('غیرفعال', 'Disabled'),
              'defaultValue': '—',
              'isDisabled': true,
            },
          },
        ]),
        note: t(
          'ستاره ترکیب شده؛ متریال نشانه‌ای برای الزامی ندارد',
          'the asterisk is composed: M3 has no required mark',
        ),
      ),
      Sample(
        'textarea-search',
        'TextArea · SearchField',
        _stack([
          {
            'type': 'TextArea',
            'props': {
              'label': t('توضیح', 'Description'),
              'rows': 4,
              'placeholder': t(
                'دربارهٔ جنس و اندازه بنویسید',
                'Material and sizing',
              ),
              'description': t('چهار سطر، مثل وب', 'Four rows, as on the web'),
            },
          },
          {
            'type': 'SearchField',
            'props': {
              'label': t('جستجوی سفارش', 'Search orders'),
              'placeholder': t('شماره یا نام مشتری', 'Number or customer'),
            },
            'actions': {
              'onSubmit': _call('orders.search'),
              'onChange': _set('q'),
            },
          },
          {
            'type': 'SearchField',
            'props': {
              'label': t('جستجو', 'Search'),
              'defaultValue': t('شال', 'scarf'),
              'variant': 'secondary',
            },
          },
        ]),
      ),
      Sample(
        'numberfield',
        'NumberField',
        _stack([
          {
            'type': 'NumberField',
            'props': {
              'label': t('وزن (گرم)', 'Weight (g)'),
              'defaultValue': 1250,
              'minValue': 0,
              'maxValue': 30000,
              'step': 50,
            },
            'actions': {'onChange': _set('weight')},
          },
          {
            'type': 'NumberField',
            'props': {
              'label': t('تخفیف', 'Discount'),
              'formatStyle': 'percent',
              'defaultValue': 0.15,
              'minValue': 0,
              'maxValue': 1,
              'step': 0.05,
            },
          },
          {
            'type': 'NumberField',
            'props': {
              'label': t('قیمت به دلار', 'Price in USD'),
              'formatStyle': 'currency',
              'currency': 'USD',
              'defaultValue': 1234.5,
              'hideSteppers': true,
            },
          },
          {
            'type': 'NumberField',
            'props': {
              'label': t('قیمت به تومان', 'Price in toman'),
              'formatStyle': 'currency',
              'currency': 'IRT',
              'defaultValue': 1250000,
              'hideSteppers': true,
            },
          },
          {
            'type': 'NumberField',
            'props': {
              'label': t('قیمت به ریال', 'Price in rials'),
              'formatStyle': 'currency',
              'currency': 'IRR',
              'defaultValue': 1250000,
              'hideSteppers': true,
              'isRequired': true,
            },
          },
        ]),
        note: t(
          'تومان (IRT) ساخته می‌شود: مبلغ و «تومان»',
          'IRT is composed: the amount and «تومان»',
        ),
      ),
      Sample(
        'datefield',
        'DateField',
        _stack([
          {
            'type': 'DateField',
            'props': {
              'label': t('تاریخ ارسال', 'Ship date'),
              'defaultValue': '2026-10-16',
              'isRequired': true,
            },
            'actions': {'onChange': _set('shipDate')},
          },
          {
            'type': 'DateField',
            'props': {
              'label': t('زمان تحویل', 'Delivery slot'),
              'granularity': 'hour',
              'defaultValue': '2026-10-17T14:00',
              'hourCycle': 24,
            },
          },
          {
            'type': 'DateField',
            'props': {
              'label': t(
                'تاریخ انقضای گذرنامه (میلادی)',
                'Passport expiry (Gregorian)',
              ),
              'calendarSystem': 'gregorian',
              'defaultValue': '2031-03-21',
            },
          },
          {
            'type': 'DateField',
            'props': {
              'label': t('تاریخ تولد (شمسی)', 'Birthday (Jalali)'),
              'calendarSystem': 'persian',
              'defaultValue': '1990-06-01',
              'maxValue': '2026-10-16',
            },
          },
        ]),
        note: t(
          'مقدار همیشه ISO میلادی است؛ تقویم فقط نمایش است',
          'the value is always Gregorian ISO; the calendar is only display',
        ),
      ),
    ]),

    // ------------------------------------------------------------------ 3
    SampleGroup('pickers', t('۳ · انتخاب‌گرها', '3 · Pickers'), [
      Sample(
        'select',
        'Select · ListBoxItem · ListBoxSection',
        _stack([
          {
            'type': 'Select',
            'props': {
              'label': t('روش ارسال', 'Shipping method'),
              'placeholder': t('انتخاب کنید', 'Choose one'),
              'isRequired': true,
              'defaultSelectedKey': 'tipax',
            },
            'actions': {'onSelectionChange': _set('carrier')},
            'children': [
              {
                'type': 'ListBoxSection',
                'props': {'title': t('پیک', 'Courier')},
                'children': [
                  _item(
                    'tipax',
                    t('تیپاکس', 'Tipax'),
                    props: {
                      'icon': 'truck',
                      'description': t('۲ تا ۳ روز', '2–3 days'),
                    },
                  ),
                  _item(
                    'snapp',
                    t('اسنپ‌باکس', 'Snapp Box'),
                    props: {
                      'icon': 'package',
                      'description': t('همان روز', 'Same day'),
                    },
                  ),
                ],
              },
              {
                'type': 'ListBoxSection',
                'props': {'title': t('پست', 'Post')},
                'children': [
                  _item(
                    'post',
                    t('پست پیشتاز', 'Express post'),
                    props: {'icon': 'mail'},
                  ),
                  _item(
                    'pickup',
                    t('تحویل حضوری', 'In-store pickup'),
                    props: {'icon': 'store', 'isDisabled': true},
                  ),
                ],
              },
            ],
          },
          {
            'type': 'Select',
            'props': {
              'label': t('برچسب‌ها', 'Tags'),
              'selectionMode': 'multiple',
              'defaultSelectedKeys': ['new', 'sale'],
              'variant': 'secondary',
            },
            'children': [
              _item('new', t('تازه', 'New')),
              _item('sale', t('حراج', 'Sale')),
              _item('gift', t('هدیه', 'Gift')),
            ],
          },
        ]),
      ),
      Sample(
        'combobox',
        'ComboBox',
        _stack([
          {
            'type': 'ComboBox',
            'props': {
              'label': t('شهر', 'City'),
              'placeholder': t('بنویسید…', 'Type…'),
              'emptyMessage': t('شهری پیدا نشد', 'No city found'),
              'menuTrigger': 'focus',
            },
            'actions': {
              'onSelectionChange': _set('city'),
              'onInputChange': _set('cityText'),
            },
            'children': [
              _item('thr', t('تهران', 'Tehran')),
              _item('isf', t('اصفهان', 'Isfahan')),
              _item('shz', t('شیراز', 'Shiraz')),
              _item('tbz', t('تبریز', 'Tabriz')),
            ],
          },
          {
            'type': 'ComboBox',
            'props': {
              'label': t('برچسب آزاد', 'Free-text tag'),
              'allowsCustomValue': true,
              'defaultInputValue': t('پاییزه', 'autumn'),
            },
            'children': [
              _item('summer', t('تابستانه', 'summer')),
              _item('winter', t('زمستانه', 'winter')),
            ],
          },
        ]),
      ),
      Sample(
        'listbox',
        'ListBox',
        _stack(row: true, [
          {
            'type': 'ListBox',
            'props': {'label': t('کارها', 'Actions'), 'selectionMode': 'none'},
            'actions': {
              'onAction': {'do': 'call', 'action': 'row.open', 'value': 'row'},
            },
            'children': [
              _item('edit', t('ویرایش', 'Edit'), props: {'icon': 'pencil'}),
              _item(
                'copy',
                t('رونوشت', 'Duplicate'),
                props: {
                  'icon': 'copy',
                  'description': t('با همهٔ گونه‌ها', 'With all variants'),
                },
              ),
              _item(
                'delete',
                t('حذف', 'Delete'),
                props: {'icon': 'trash-2', 'variant': 'danger'},
              ),
            ],
          },
          {
            'type': 'ListBox',
            'props': {
              'label': t('اندازه', 'Size'),
              'selectionMode': 'single',
              'defaultSelectedKeys': ['m'],
            },
            'children': [_item('s', 'S'), _item('m', 'M'), _item('l', 'L')],
          },
          {
            'type': 'ListBox',
            'props': {
              'label': t('ستون‌ها', 'Columns'),
              'selectionMode': 'multiple',
              'defaultSelectedKeys': ['price', 'stock'],
            },
            'children': [
              _item('price', t('قیمت', 'Price')),
              _item('stock', t('موجودی', 'Stock')),
              _item('sku', 'SKU'),
            ],
          },
          {
            'type': 'ListBox',
            'props': {
              'label': t('خالی', 'Empty'),
              'emptyMessage': t('هنوز چیزی نیست', 'Nothing yet'),
            },
            'children': <Tree>[],
          },
        ]),
      ),
      Sample(
        'dropdown',
        'Dropdown · DropdownItem · DropdownSection',
        _stack(row: true, [
          {
            'type': 'Dropdown',
            'props': {'placement': 'bottom end'},
            'slots': {
              'trigger': _button(
                t('کارها', 'Actions'),
                props: {'icon': 'ellipsis-vertical', 'variant': 'outline'},
              ),
            },
            'actions': {
              'onAction': {
                'do': 'call',
                'action': 'order.menu',
                'value': 'item',
              },
            },
            'children': [
              {
                'type': 'DropdownSection',
                'props': {'title': t('سفارش', 'Order')},
                'children': [
                  {
                    'type': 'DropdownItem',
                    'props': {'id': 'print', 'icon': 'printer'},
                    'children': t('چاپ برچسب', 'Print label'),
                  },
                  {
                    'type': 'DropdownItem',
                    'props': {
                      'id': 'invoice',
                      'icon': 'receipt',
                      'description': t('با مالیات', 'With VAT'),
                    },
                    'children': t('صورت‌حساب', 'Invoice'),
                  },
                ],
              },
              {
                'type': 'DropdownSection',
                'props': {'title': t('خطرناک', 'Danger zone')},
                'children': [
                  {
                    'type': 'DropdownItem',
                    'props': {
                      'id': 'cancel',
                      'icon': 'circle-x',
                      'variant': 'danger',
                    },
                    'children': t('لغو سفارش', 'Cancel order'),
                  },
                ],
              },
            ],
          },
          {
            'type': 'Dropdown',
            'props': {
              'selectionMode': 'multiple',
              'defaultSelectedKeys': ['price'],
              'placement': 'bottom start',
            },
            'slots': {
              'trigger': _button(
                t('ستون‌ها', 'Columns'),
                props: {'icon': 'sliders-horizontal'},
              ),
            },
            'children': [
              {
                'type': 'DropdownItem',
                'props': {'id': 'price'},
                'children': t('قیمت', 'Price'),
              },
              {
                'type': 'DropdownItem',
                'props': {'id': 'stock'},
                'children': t('موجودی', 'Stock'),
              },
            ],
          },
        ]),
      ),
    ]),

    // ------------------------------------------------------------------ 4
    SampleGroup('choices', t('۴ · گزینه‌ها', '4 · Choices'), [
      Sample(
        'checkbox',
        'Checkbox',
        _stack([
          {
            'type': 'Checkbox',
            'props': {
              'label': t('بیمهٔ مرسوله', 'Insure the parcel'),
              'defaultSelected': true,
              'description': t('تا ۵۰ میلیون تومان', 'Up to 50M Toman'),
            },
          },
          {
            'type': 'Checkbox',
            'props': {
              'label': t('همهٔ محصولات', 'All products'),
              'isIndeterminate': true,
            },
          },
          {
            'type': 'Checkbox',
            'props': {
              'label': t('شرایط را می‌پذیرم', 'I accept the terms'),
              'isRequired': true,
              'errorMessage': t(
                'برای ادامه لازم است.',
                'Required to continue.',
              ),
            },
          },
          {
            'type': 'Checkbox',
            'props': {'label': t('غیرفعال', 'Disabled'), 'isDisabled': true},
          },
          {
            'type': 'Checkbox',
            'props': {
              'label': t('روی کارت خاکستری', 'On a grey card'),
              'variant': 'secondary',
            },
          },
        ]),
      ),
      Sample(
        'checkboxgroup',
        'CheckboxGroup',
        _stack([
          {
            'type': 'CheckboxGroup',
            'props': {
              'label': t('روزهای کاری', 'Working days'),
              'defaultValue': ['sat', 'sun'],
              'isRequired': true,
              'description': t('دست‌کم یک روز', 'At least one'),
            },
            'actions': {'onChange': _set('days')},
            'children': [
              {
                'type': 'Checkbox',
                'props': {'value': 'sat', 'label': t('شنبه', 'Saturday')},
              },
              {
                'type': 'Checkbox',
                'props': {'value': 'sun', 'label': t('یکشنبه', 'Sunday')},
              },
              {
                'type': 'Checkbox',
                'props': {
                  'value': 'fri',
                  'label': t('جمعه', 'Friday'),
                  'isDisabled': true,
                },
              },
            ],
          },
          {
            'type': 'CheckboxGroup',
            'props': {
              'label': t('کانال‌ها', 'Channels'),
              'orientation': 'horizontal',
            },
            'children': [
              {
                'type': 'Checkbox',
                'props': {'value': 'store', 'label': t('فروشگاه', 'Store')},
              },
              {
                'type': 'Checkbox',
                'props': {'value': 'torob', 'label': t('ترب', 'Torob')},
              },
              {
                'type': 'Checkbox',
                'props': {'value': 'emalls', 'label': t('ایمالز', 'Emalls')},
              },
            ],
          },
        ]),
      ),
      Sample(
        'radiogroup',
        'RadioGroup · Radio',
        _stack([
          {
            'type': 'RadioGroup',
            'props': {
              'label': t('پرداخت', 'Payment'),
              'defaultValue': 'online',
              'isRequired': true,
            },
            'actions': {'onChange': _set('pay')},
            'children': [
              {
                'type': 'Radio',
                'props': {
                  'value': 'online',
                  'label': t('درگاه بانکی', 'Card gateway'),
                  'description': t('شاپرک', 'Shaparak'),
                },
              },
              {
                'type': 'Radio',
                'props': {
                  'value': 'cod',
                  'label': t('پرداخت در محل', 'Cash on delivery'),
                },
              },
              {
                'type': 'Radio',
                'props': {
                  'value': 'credit',
                  'label': t('اعتباری', 'Credit'),
                  'isDisabled': true,
                },
              },
            ],
          },
          {
            'type': 'RadioGroup',
            'props': {
              'label': t('اندازه', 'Size'),
              'orientation': 'horizontal',
              'errorMessage': t('یکی را انتخاب کنید.', 'Choose one.'),
            },
            'children': [
              {
                'type': 'Radio',
                'props': {'value': 's', 'label': 'S'},
              },
              {
                'type': 'Radio',
                'props': {'value': 'm', 'label': 'M'},
              },
              {
                'type': 'Radio',
                'props': {'value': 'l', 'label': 'L'},
              },
            ],
          },
        ]),
      ),
      Sample(
        'switch',
        'Switch',
        _stack([
          {
            'type': 'Switch',
            'props': {
              'label': t('فروشگاه باز است', 'Store is open'),
              'defaultSelected': true,
              'size': 'sm',
            },
          },
          {
            'type': 'Switch',
            'props': {
              'label': t('ارسال رایگان', 'Free shipping'),
              'description': t('بالای ۲ میلیون تومان', 'Over 2M Toman'),
            },
          },
          {
            'type': 'Switch',
            'props': {
              'label': t('حالت آزمایشی (از سرور)', 'Test mode (pinned)'),
              'isSelected': true,
              'size': 'lg',
            },
          },
          {
            'type': 'Switch',
            'props': {'label': t('غیرفعال', 'Disabled'), 'isDisabled': true},
          },
        ]),
      ),
      Sample(
        'slider',
        'Slider',
        _stack([
          {
            'type': 'Slider',
            'props': {
              'label': t('حداقل سفارش', 'Minimum order'),
              'minValue': 0,
              'maxValue': 5000000,
              'step': 100000,
              'defaultValue': 1500000,
              'formatStyle': 'currency',
              'currency': 'IRT',
            },
            'actions': {'onChangeEnd': _set('min')},
          },
          {
            'type': 'Slider',
            'props': {
              'label': t('بازهٔ قیمت', 'Price range'),
              'isRange': true,
              'minValue': 0,
              'maxValue': 100,
              'defaultValue': [20, 70],
              'description': t('هزار تومان', 'thousand Toman'),
            },
          },
          {
            'type': 'Slider',
            'props': {
              'label': t('شفافیت', 'Opacity'),
              'formatStyle': 'percent',
              'defaultValue': 60,
              'isDisabled': true,
            },
          },
        ]),
      ),
    ]),

    // ------------------------------------------------------------------ 5
    SampleGroup('status', t('۵ · وضعیت', '5 · Status'), [
      Sample(
        'alert',
        'Alert',
        _stack([
          {
            'type': 'Alert',
            'props': {
              'status': 'danger',
              'title': t('پرداخت ناموفق بود', 'Payment failed'),
              'description': t(
                'درگاه پاسخ نداد. دوباره تلاش کنید.',
                'The gateway did not answer. Try again.',
              ),
            },
            'slots': {
              'actions': _stack(row: true, gap: 2, [
                _button(
                  t('تلاش دوباره', 'Retry'),
                  props: {'variant': 'danger', 'size': 'sm'},
                ),
                {
                  'type': 'LinkButton',
                  'props': {'href': '/settings/payments', 'variant': 'ghost'},
                  'children': t('تنظیمات', 'Settings'),
                },
              ]),
            },
          },
          {
            'type': 'Alert',
            'props': {
              'status': 'warning',
              'title': t('موجودی کم است', 'Stock is low'),
              'isDismissible': true,
            },
          },
          {
            'type': 'Alert',
            'props': {
              'status': 'success',
              'title': t('دامنه تأیید شد', 'Domain verified'),
            },
          },
          {
            'type': 'Alert',
            'props': {
              'status': 'accent',
              'title': t('ویژگی تازه', 'New feature'),
              'icon': 'sparkles',
              'description': t(
                'کالادان حالا کارت‌های برنامه دارد.',
                'Kaladan now has app cards.',
              ),
            },
          },
          {
            'type': 'Alert',
            'props': {
              'status': 'default',
              'title': t('یادداشت', 'A note'),
              'hideIcon': true,
            },
          },
        ]),
        note: t(
          'سبز و نارنجی از توکن‌ها؛ متریال نقش success و warning ندارد',
          'green and orange come from tokens: M3 has no success or warning role',
        ),
      ),
      Sample(
        'chip',
        'Chip',
        _stack([
          for (final variant in ['soft', 'primary', 'secondary', 'tertiary'])
            _stack(row: true, gap: 2, [
              for (final colour in [
                'default',
                'accent',
                'success',
                'warning',
                'danger',
              ])
                {
                  'type': 'Chip',
                  'props': {'variant': variant, 'color': colour},
                  'children': '$variant·$colour',
                },
            ]),
          _stack(row: true, gap: 2, [
            {
              'type': 'Chip',
              'props': {
                'size': 'sm',
                'color': 'success',
                'icon': 'circle-check',
              },
              'children': t('پرداخت‌شده', 'Paid'),
            },
            {
              'type': 'Chip',
              'props': {'size': 'md', 'color': 'warning'},
              'children': t('در انتظار', 'Pending'),
            },
            {
              'type': 'Chip',
              'props': {'size': 'lg', 'color': 'danger'},
              'children': t('لغوشده', 'Cancelled'),
            },
          ]),
        ]),
      ),
      Sample(
        'taggroup',
        'TagGroup · Tag',
        _stack([
          {
            'type': 'TagGroup',
            'props': {'label': t('کلیدواژه‌ها', 'Keywords')},
            'actions': {
              'onRemove': {
                'do': 'call',
                'action': 'keyword.remove',
                'value': 'tag',
              },
            },
            'children': [
              {
                'type': 'Tag',
                'props': {'id': 'silk'},
                'children': t('ابریشم', 'silk'),
              },
              {
                'type': 'Tag',
                'props': {'id': 'scarf', 'icon': 'tag'},
                'children': t('شال', 'scarf'),
              },
              {
                'type': 'Tag',
                'props': {'id': 'gift', 'isDisabled': true},
                'children': t('هدیه', 'gift'),
              },
            ],
          },
          {
            'type': 'TagGroup',
            'props': {
              'label': t('وضعیت', 'Status'),
              'selectionMode': 'single',
              'defaultSelectedKeys': ['open'],
              'size': 'sm',
            },
            'children': [
              {
                'type': 'Tag',
                'props': {'id': 'open'},
                'children': t('باز', 'Open'),
              },
              {
                'type': 'Tag',
                'props': {'id': 'closed'},
                'children': t('بسته', 'Closed'),
              },
            ],
          },
          {
            'type': 'TagGroup',
            'props': {
              'label': t('فیلترها', 'Filters'),
              'selectionMode': 'multiple',
              'defaultSelectedKeys': ['a', 'c'],
              'variant': 'surface',
              'size': 'lg',
            },
            'children': [
              {
                'type': 'Tag',
                'props': {'id': 'a'},
                'children': t('موجود', 'In stock'),
              },
              {
                'type': 'Tag',
                'props': {'id': 'b'},
                'children': t('حراج', 'On sale'),
              },
              {
                'type': 'Tag',
                'props': {'id': 'c', 'href': '/products?new=1'},
                'children': t('تازه', 'New'),
              },
            ],
          },
          {
            'type': 'TagGroup',
            'props': {
              'label': t('بدون برچسب', 'No tags'),
              'emptyMessage': t('هنوز کلیدواژه‌ای نیست', 'No keywords yet'),
            },
            'children': <Tree>[],
          },
        ]),
      ),
      Sample(
        'spinner-progress',
        'Spinner · ProgressBar',
        _stack([
          _stack(row: true, [
            for (final size in ['sm', 'md', 'lg', 'xl'])
              {
                'type': 'Spinner',
                'props': {'size': size},
              },
            for (final colour in ['success', 'warning', 'danger', 'current'])
              {
                'type': 'Spinner',
                'props': {'color': colour, 'size': 'sm'},
              },
          ]),
          {
            'type': 'ProgressBar',
            'props': {
              'label': t('درون‌ریزی محصولات', 'Importing products'),
              'value': 64,
            },
          },
          {
            'type': 'ProgressBar',
            'props': {
              'label': t('ارسال‌شده', 'Shipped'),
              'value': 3,
              'maxValue': 10,
              'valueLabel': t('۳ از ۱۰', '3 of 10'),
              'color': 'success',
              'size': 'sm',
            },
          },
          {
            'type': 'ProgressBar',
            'props': {
              'label': t('فضای ذخیره', 'Storage'),
              'value': 0.92,
              'maxValue': 1,
              'color': 'danger',
              'size': 'lg',
            },
          },
          {
            'type': 'ProgressBar',
            'props': {
              'label': t('در انتظار سرور', 'Waiting on the server'),
              'isIndeterminate': true,
              'color': 'default',
            },
          },
        ]),
      ),
      Sample(
        'avatar',
        'Avatar · AvatarGroup',
        _stack([
          _stack(row: true, [
            {
              'type': 'Avatar',
              'props': {
                'name': t('نیلوفر رستمی', 'Niloufar Rostami'),
                'size': 'sm',
              },
            },
            {
              'type': 'Avatar',
              'props': {
                'name': t('امید کاظمی', 'Omid Kazemi'),
                'color': 'accent',
              },
            },
            {
              'type': 'Avatar',
              'props': {
                'name': t('سارا', 'Sara'),
                'color': 'success',
                'variant': 'soft',
                'size': 'lg',
              },
            },
            {
              'type': 'Avatar',
              'props': {'icon': 'user', 'color': 'default'},
            },
            {
              'type': 'Avatar',
              'props': {
                'name': 'Broken image',
                'src': 'https://invalid.kaladan.test/x.png',
                'color': 'warning',
                'variant': 'soft',
              },
            },
          ]),
          {
            'type': 'AvatarGroup',
            'props': {'max': 3, 'color': 'accent', 'variant': 'soft'},
            'children': [
              for (final n in [
                t('نیلوفر رستمی', 'Niloufar R'),
                t('امید کاظمی', 'Omid K'),
                t('سارا احمدی', 'Sara A'),
                t('رضا', 'Reza'),
                t('مینا', 'Mina'),
              ])
                {
                  'type': 'Avatar',
                  'props': {'name': n},
                },
            ],
          },
          {
            'type': 'AvatarGroup',
            'props': {'overlap': 'ring', 'size': 'sm'},
            'children': [
              {
                'type': 'Avatar',
                'props': {'name': 'A B', 'color': 'danger'},
              },
              {
                'type': 'Avatar',
                'props': {'name': 'C D', 'color': 'success'},
              },
              {
                'type': 'Avatar',
                'props': {'name': 'E F', 'color': 'warning'},
              },
            ],
          },
          {
            'type': 'AvatarGroup',
            'props': {'isGrid': true, 'size': 'sm'},
            'children': [
              for (final n in ['A', 'B', 'C', 'D', 'E', 'F'])
                {
                  'type': 'Avatar',
                  'props': {'name': n},
                },
            ],
          },
        ]),
        note: t('«+۲» با رقم فارسی', '"+2" in the reader\'s digits'),
      ),
      Sample(
        'toast',
        'toast (verb)',
        _stack(row: true, [
          for (final status in [
            'default',
            'accent',
            'success',
            'warning',
            'danger',
          ])
            _button(
              status,
              onPress: {
                'do': 'toast',
                'status': status,
                'title': t('ذخیره شد', 'Saved'),
                'description': t('تغییرها ثبت شد.', 'Your changes are in.'),
                if (status == 'default') ...{
                  'actionLabel': t('برگرداندن', 'Undo'),
                  'onAction': {'do': 'call', 'action': 'undo'},
                },
              },
            ),
        ]),
      ),
      Sample(
        'guard',
        t('متن ساده، نشانی‌ها به‌ازای prop', 'Plain text, URLs by prop'),
        _stack([
          {
            'type': 'Alert',
            'props': {
              'status': 'warning',
              'title': t('هشدار: موجودی کم است', 'Warning: stock is low'),
            },
          },
          {
            'type': 'Alert',
            'props': {
              'status': 'default',
              'title': t('پاسخ: سفارش شما', 'Re: your order'),
              'description': 'sku:123',
            },
          },
          _text(
            t(
              'این‌ها متن‌اند و رد نمی‌شوند. فقط propهای نشانی (href، src، image) قاعدهٔ نشانی دارند.',
              'These are text and render. Only URL props (href, src, image) are held to a URL rule.',
            ),
            tone: 'muted',
            size: 'sm',
          ),
        ]),
        note: t(
          'پیش‌تر عنوان انگلیسی رد می‌شد',
          'the English title used to be refused',
        ),
      ),
    ]),

    // ------------------------------------------------------------------ 6
    SampleGroup('containers', t('۶ · ظرف‌ها', '6 · Containers'), [
      Sample(
        'card',
        'Card',
        _stack([
          {
            'type': 'Card',
            'props': {
              'title': t('فروش امروز', 'Today\'s sales'),
              'description': t('تا ساعت ۱۴', 'As of 2 pm'),
            },
            'slots': {
              'action': {
                'type': 'LinkButton',
                'props': {'href': '/analytics', 'variant': 'ghost'},
                'children': t('همه', 'See all'),
              },
              'footer': _text(
                t('۱۲ سفارش', '12 orders'),
                tone: 'muted',
                size: 'sm',
              ),
            },
            'children': [
              _text(t('۲۴٬۵۰۰٬۰۰۰ تومان', '24,500,000 Toman'), size: '2xl'),
            ],
          },
          _stack(row: true, [
            for (final variant in ['secondary', 'tertiary', 'transparent'])
              {
                'type': 'Card',
                'props': {'variant': variant, 'title': variant},
                'children': [_text('…')],
              },
          ]),
          {
            'type': 'Card',
            'props': {
              'title': t('کارت پیوندی', 'A linked card'),
              'description': t('کل کارت باز می‌شود', 'The whole card opens'),
              'href': '/orders/DB-1041',
            },
          },
        ]),
        note: t(
          'سومی سطح ۳ است، توکن تازه',
          'tertiary is surface-3, a new token',
        ),
      ),
      Sample(
        'tabs',
        'Tabs · Tab',
        {
          'type': 'Tabs',
          'props': {'selectedKey': 'orders'},
          'actions': {'onChange': _set('tab')},
          'children': [
            for (final (id, label, body) in [
              (
                'orders',
                t('سفارش‌ها', 'Orders'),
                t('۱۲ سفارش تازه', '12 new orders'),
              ),
              (
                'customers',
                t('مشتری‌ها', 'Customers'),
                t('۳ مشتری تازه', '3 new customers'),
              ),
              (
                'returns',
                t('مرجوعی‌ها', 'Returns'),
                t('مرجوعی ندارید', 'No returns'),
              ),
            ])
              {
                'type': 'Tab',
                'props': {'id': id, 'label': label},
                'children': [_text(body)],
              },
          ],
        },
        note: t('ظاهرش قرص روی فهرست است', 'its look is a pill on a list'),
      ),
      Sample(
        'table',
        'Table · Column · Row · Cell · TableFooter',
        {
          'type': 'Table',
          'props': {
            'label': t('سفارش‌ها', 'Orders'),
            'selectionMode': 'multiple',
            'defaultSelectedKeys': ['1041'],
            'defaultSortColumn': 'total',
            'defaultSortDirection': 'descending',
            'emptyMessage': t('سفارشی نیست', 'No orders'),
          },
          'actions': {
            'onSortChange': {
              'do': 'call',
              'action': 'orders.sort',
              'value': 'sort',
            },
            'onSelectionChange': _set('rows'),
            'onRowAction': {
              'do': 'call',
              'action': 'order.open',
              'value': 'order',
            },
            'onLoadMore': _call('orders.more'),
          },
          'children': [
            {
              'type': 'TableHeader',
              'children': [
                {
                  'type': 'Column',
                  'props': {'id': 'code', 'isRowHeader': true},
                  'children': t('سفارش', 'Order'),
                },
                {
                  'type': 'Column',
                  'props': {'id': 'customer'},
                  'children': t('مشتری', 'Customer'),
                },
                {
                  'type': 'Column',
                  'props': {'id': 'status', 'align': 'center'},
                  'children': t('وضعیت', 'Status'),
                },
                {
                  'type': 'Column',
                  'props': {
                    'id': 'total',
                    'allowsSorting': true,
                    'align': 'end',
                  },
                  'children': t('مبلغ', 'Total'),
                },
              ],
            },
            {
              'type': 'TableBody',
              'children': [
                for (final (id, name, status, colour, total) in [
                  (
                    '1041',
                    t('نیلوفر رستمی', 'Niloufar Rostami'),
                    t('پرداخت‌شده', 'Paid'),
                    'success',
                    t('۱٬۲۴۰٬۰۰۰', '1,240,000'),
                  ),
                  (
                    '1042',
                    t('امید کاظمی', 'Omid Kazemi'),
                    t('در انتظار', 'Pending'),
                    'warning',
                    t('۸۹۰٬۰۰۰', '890,000'),
                  ),
                  (
                    '1043',
                    t('سارا احمدی', 'Sara Ahmadi'),
                    t('لغوشده', 'Cancelled'),
                    'danger',
                    t('۴۵۰٬۰۰۰', '450,000'),
                  ),
                ])
                  {
                    'type': 'Row',
                    'props': {'id': id, 'isDisabled': colour == 'danger'},
                    'children': [
                      {'type': 'Cell', 'children': 'DB-$id'},
                      {'type': 'Cell', 'children': name},
                      {
                        'type': 'Cell',
                        'children': [
                          {
                            'type': 'Chip',
                            'props': {'color': colour},
                            'children': status,
                          },
                        ],
                      },
                      {'type': 'Cell', 'children': total},
                    ],
                  },
              ],
            },
            {
              'type': 'TableFooter',
              'children': [
                {
                  'type': 'Row',
                  'props': {'id': 'sum'},
                  'children': [
                    {'type': 'Cell', 'children': t('جمع', 'Total')},
                    {'type': 'Cell', 'children': ''},
                    {'type': 'Cell', 'children': ''},
                    {'type': 'Cell', 'children': t('۲٬۵۸۰٬۰۰۰', '2,580,000')},
                  ],
                },
              ],
            },
          ],
        },
        note: t(
          'جمع پایانی ردیف آخر DataTable است',
          'the footer is DataTable\'s last row',
        ),
      ),
      Sample(
        'overlays',
        'Modal · AlertDialog · Popover',
        _stack(row: true, [
          {
            'type': 'Modal',
            'props': {
              'title': t('ویرایش نشانی', 'Edit address'),
              'icon': 'map-pin',
              'size': 'md',
            },
            'slots': {
              'trigger': _button(
                t('ویرایش نشانی', 'Edit address'),
                props: {'icon': 'pencil'},
              ),
              'footer': _stack(row: true, gap: 2, [
                _button(
                  t('انصراف', 'Cancel'),
                  props: {'variant': 'ghost'},
                  onPress: {'do': 'close'},
                ),
                _button(
                  t('ذخیره', 'Save'),
                  props: {'variant': 'primary'},
                  // Save, then close: the close waits for the call, and a
                  // failed call keeps the dialog open.
                  onPress: [
                    _call('address.save', ['city', 'street']),
                    {'do': 'close'},
                  ],
                ),
              ]),
            },
            'children': [
              {
                'type': 'TextField',
                'props': {
                  'label': t('شهر', 'City'),
                  'defaultValue': t('تهران', 'Tehran'),
                },
                'actions': {'onChange': _set('city')},
              },
              {
                'type': 'TextArea',
                'props': {'label': t('نشانی', 'Street'), 'rows': 2},
                'actions': {'onChange': _set('street')},
              },
              {
                'type': 'Checkbox',
                'props': {'label': t('نشانی پیش‌فرض', 'Default address')},
              },
            ],
          },
          {
            'type': 'AlertDialog',
            'props': {
              'status': 'danger',
              'title': t('حذف این محصول؟', 'Delete this product?'),
              'description': t(
                'این کار برگشت‌پذیر نیست.',
                'This cannot be undone.',
              ),
              'confirmLabel': t('حذف', 'Delete'),
            },
            'slots': {
              'trigger': _button(
                t('حذف محصول', 'Delete product'),
                props: {'variant': 'danger-soft', 'icon': 'trash-2'},
              ),
            },
            'actions': {'onConfirm': _call('product.delete')},
          },
          {
            'type': 'Popover',
            'props': {
              'title': t('کارمزد چیست؟', 'What is the fee?'),
              'placement': 'bottom start',
              'showArrow': true,
            },
            'slots': {
              'trigger': _button(
                t('کارمزد', 'Fee'),
                props: {'icon': 'circle-help', 'variant': 'ghost'},
              ),
            },
            'children': [
              _text(
                t(
                  '۲٪ از هر سفارش، پس از تسویه.',
                  '2% of each order, after settlement.',
                ),
                size: 'sm',
              ),
            ],
          },
        ]),
      ),
      Sample(
        'form',
        'Form · Button type',
        {
          'type': 'Form',
          'props': {'gap': 3},
          'actions': {'onSubmit': _call('profile.save')},
          'children': [
            {
              'type': 'TextField',
              'props': {
                'label': t('نام فروشگاه', 'Store name'),
                'name': 'store',
                'isRequired': true,
                'defaultValue': t('کالادان', 'Kaladan'),
              },
            },
            {
              'type': 'TextField',
              'props': {
                'label': t('ایمیل', 'Email'),
                'name': 'email',
                'type': 'email',
                'isRequired': true,
              },
            },
            {
              'type': 'NumberField',
              'props': {
                'label': t('حداقل سفارش', 'Minimum order'),
                'name': 'min',
                'minValue': 0,
                'maxValue': 1000000,
                'isRequired': true,
              },
            },
            {
              'type': 'Checkbox',
              'props': {
                'label': t('خبرنامه', 'Newsletter'),
                'name': 'news',
                'defaultSelected': true,
              },
            },
            _stack(row: true, gap: 2, [
              _button(
                t('ذخیره', 'Save'),
                props: {'type': 'submit', 'variant': 'primary'},
              ),
              _button(
                t('از نو', 'Reset'),
                props: {'type': 'reset', 'variant': 'ghost'},
              ),
            ]),
          ],
        },
        note: t(
          'ذخیره را بزنید: بررسی‌ها پیش از onSubmit',
          'press Save: the checks run before onSubmit',
        ),
      ),
    ]),
  ];
}
