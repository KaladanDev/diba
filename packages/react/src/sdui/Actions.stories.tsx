import type { Meta, StoryObj } from '@storybook/react-vite'
import { useT } from '../stories/kit'
import { TreeDemo } from '../stories/sdui'

// The six things an action can do, what a field holds, and forms. The docs page is Actions.mdx.
// A line comment, not a doc comment: the docs plugin replaces a commented meta's parameters with
// one.
const meta = {
  title: 'SDUI/Actions and state',
  parameters: { layout: 'fullscreen' },
} satisfies Meta

export default meta

/** setState keeps a value in the surface; call sends the ones it names to the host. */
export const SetStateAndCall: StoryObj = {
  name: 'setState and call',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 3 },
      children: [
        {
          type: 'Select',
          props: {
            label: t('روش ارسال', 'Shipping'),
            defaultSelectedKey: 'tipax',
          },
          actions: { onSelectionChange: { do: 'setState', key: 'carrier' } },
          children: [
            { type: 'ListBoxItem', props: { id: 'tipax' }, children: t('تیپاکس', 'Tipax') },
            { type: 'ListBoxItem', props: { id: 'post' }, children: t('پست', 'Post') },
          ],
        },
        {
          type: 'Checkbox',
          props: { label: t('بیمهٔ ارسال', 'Insure it') },
          actions: { onChange: { do: 'setState', key: 'insured' } },
        },
        {
          type: 'Button',
          props: { variant: 'primary' },
          children: t('ثبت', 'Save'),
          actions: {
            onPress: { do: 'call', action: 'shipping.save', with: ['carrier', 'insured'] },
          },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A field's own value sent as it changes, under a name the action gives it. */
export const CallWithValue: StoryObj = {
  name: 'call with the event’s value',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Switch',
      props: { label: t('فروشگاه باز است', 'The shop is open'), defaultSelected: true },
      actions: { onChange: { do: 'call', action: 'shop.setOpen', value: 'open' } },
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** navigate goes to an address, open to a place the host names. */
export const NavigateAndOpen: StoryObj = {
  name: 'navigate and open',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2 },
      children: [
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('همهٔ سفارش‌ها', 'All orders'),
          actions: { onPress: { do: 'navigate', to: '/orders?status=open' } },
        },
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('ویرایش مشتری', 'Edit the customer'),
          actions: { onPress: { do: 'open', target: 'customer.edit' } },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A toast in each status, and one with a way to undo. */
export const Toasts: StoryObj = {
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2, wrap: true },
      children: [
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('ذخیره', 'Save'),
          actions: { onPress: { do: 'toast', status: 'success', title: t('ذخیره شد', 'Saved') } },
        },
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('هشدار', 'Warn'),
          actions: {
            onPress: {
              do: 'toast',
              status: 'warning',
              title: t('موجودی کم است', 'Stock is low'),
              description: t('۳ عدد مانده است.', '3 left.'),
            },
          },
        },
        {
          type: 'Button',
          props: { size: 'sm', variant: 'danger-soft' },
          children: t('بایگانی', 'Archive'),
          actions: {
            onPress: [
              { do: 'call', action: 'order.archive' },
              {
                do: 'toast',
                status: 'default',
                title: t('بایگانی شد', 'Archived'),
                actionLabel: t('بازگردانی', 'Undo'),
                onAction: { do: 'call', action: 'order.unarchive' },
              },
            ],
          },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** close shuts the overlay the tree opened. */
export const Close: StoryObj = {
  name: 'close',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Modal',
      props: { title: t('حذف کالا', 'Delete the product') },
      slots: {
        trigger: {
          type: 'Button',
          props: { variant: 'danger-soft' },
          children: t('حذف', 'Delete'),
        },
        footer: {
          type: 'Stack',
          props: { direction: 'horizontal', gap: 2, justify: 'end' },
          children: [
            {
              type: 'Button',
              props: { variant: 'tertiary' },
              children: t('انصراف', 'Cancel'),
              actions: { onPress: { do: 'close' } },
            },
            {
              type: 'Button',
              props: { variant: 'danger' },
              children: t('حذف', 'Delete'),
              actions: { onPress: [{ do: 'call', action: 'product.delete' }, { do: 'close' }] },
            },
          ],
        },
      },
      children: [
        {
          type: 'Text',
          children: t('این کالا از فروشگاه برداشته می‌شود.', 'This product leaves the shop.'),
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A value the server pins keeps showing what it sent; a default is where the merchant starts. */
export const ValuePairs: StoryObj = {
  name: 'Pinned and default values',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { gap: 3 },
      children: [
        {
          type: 'Checkbox',
          props: {
            label: t(
              'پیش‌فرض: روشن، دست مشتری',
              'defaultSelected: starts on, the merchant changes it',
            ),
            defaultSelected: true,
          },
          actions: { onChange: { do: 'call', action: 'publish', value: 'on' } },
        },
        {
          type: 'Checkbox',
          props: {
            label: t('ثابت: روشن، تا درخت بعد', 'isSelected: on, until the next tree'),
            isSelected: true,
          },
          actions: { onChange: { do: 'call', action: 'publish', value: 'on' } },
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A form checks its fields in the page's language, and sends them by name once they pass. */
export const Forms: StoryObj = {
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Form',
      actions: { onSubmit: { do: 'call', action: 'customer.create' } },
      children: [
        { type: 'TextField', props: { label: t('نام', 'Name'), name: 'name', isRequired: true } },
        { type: 'TextField', props: { label: t('ایمیل', 'Email'), name: 'email', type: 'email' } },
        { type: 'NumberField', props: { label: t('سن', 'Age'), name: 'age', minValue: 18 } },
        { type: 'Checkbox', props: { label: t('خبرنامه', 'Newsletter'), name: 'news' } },
        {
          type: 'Stack',
          props: { direction: 'horizontal', gap: 2 },
          children: [
            {
              type: 'Button',
              props: { type: 'submit', variant: 'primary' },
              children: t('ساختن', 'Create'),
            },
            {
              type: 'Button',
              props: { type: 'reset', variant: 'tertiary' },
              children: t('پاک کردن', 'Clear'),
            },
          ],
        },
      ],
    }
    return <TreeDemo tree={tree} validate />
  },
}

/** A list runs in order; a call that fails stops it, so the toast after it never shows. */
export const Lists: StoryObj = {
  name: 'A list of actions',
  render: function Render() {
    const t = useT()
    const tree = {
      type: 'Stack',
      props: { direction: 'horizontal', gap: 2 },
      children: [
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('موفق', 'Succeeds'),
          actions: {
            onPress: [
              { do: 'call', action: 'stock.sync' },
              { do: 'toast', status: 'success', title: t('همگام شد', 'Synced') },
            ],
          },
        },
        {
          type: 'Button',
          props: { size: 'sm' },
          children: t('ناموفق', 'Fails'),
          actions: {
            onPress: [
              { do: 'call', action: 'stock.fail' },
              { do: 'toast', status: 'success', title: t('همگام شد', 'Synced') },
            ],
          },
        },
      ],
    }
    return (
      <TreeDemo
        tree={tree}
        validate
        handlers={{
          call: (action) =>
            action === 'stock.fail' ? Promise.reject(new Error('timeout')) : Promise.resolve(),
        }}
      />
    )
  },
}
