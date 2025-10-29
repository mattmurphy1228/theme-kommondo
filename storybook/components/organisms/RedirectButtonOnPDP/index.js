import html from '@utils/commonUtils';
import Button from '@atoms/Button';
import './RedirectButtonOnPDP.css';

const Banner = ({ buttonLabel, buttonLink = '' }) => html`
  <div class="page-width page-width--no-padding">
    <div class="redirect-button">
      <${Button} label="${buttonLabel}" href="${buttonLink}" />
    </div>
  </div>
`;

export default Banner;
