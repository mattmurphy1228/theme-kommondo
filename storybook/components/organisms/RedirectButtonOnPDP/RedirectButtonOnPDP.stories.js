import RedirectButtonOnPDP from './index';

export default {
  title: 'Components/Organisms/RedirectButtonOnPDP',
  tags: ['autodocs'],
  component: RedirectButtonOnPDP,
  argTypes: {
    buttonLabel: {
      control: { type: 'text' },
    },
    buttonLink: {
      control: { type: 'text' },
    },
  },
  parameters: {
    padded: false,
  },
};

export const defaultRedirectButtonOnPDP = {
  args: {
    buttonLabel: 'Go to Landing Page',
    buttonLink: '/',
  },
};
