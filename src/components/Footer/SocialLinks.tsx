import React from 'react';
import { IconGithub, IconDiscord } from '../Icons';
import config from '../../config';
import useStrings from '../../hooks/useStrings.hook';

export default () => {
  const strings = useStrings();
  const links = [
    {
      tooltip: strings.app_github,
      path: `//github.com/${config.GITHUB_REPO}`,
      icon: <IconGithub aria-hidden />,
    },
  ];

  if (config.DISCORD_LINK) {
    links.push({
      tooltip: strings.app_discord,
      path: `//discord.gg/${config.DISCORD_LINK}`,
      icon: <IconDiscord aria-hidden />,
    });
  }

  return (
    <div>
      {links.map((link) => (
        <a
          key={link.path}
          target="_blank"
          rel="noopener noreferrer"
          data-hint-position="top"
          data-hint={link.tooltip}
          href={link.path}
          aria-label={link.tooltip}
        >
          {link.icon}
        </a>
      ))}
    </div>
  );
};
