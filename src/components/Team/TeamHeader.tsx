import React from 'react';
import { formatTemplateToString, getTeamLogoUrl } from '../../utility';
import {
  HeaderContainer,
  Logo,
  Column,
  TeamName,
  Row,
  TeamStatsCard,
} from './TeamStyled';
import config from '../../config';

export default (generalData: any, strings: Strings) => (
  <HeaderContainer loading={generalData.loading} error={generalData.error}>
    <Logo
      src={getTeamLogoUrl(generalData.data.logo_url)}
      alt={`Logo for ${generalData.data.name}`}
    />
    <Column>
      <TeamName>{generalData.data.name}</TeamName>
      <Row>
        <TeamStatsCard
          title={strings.th_wins}
          subheader={<div className="textSuccess">{generalData.data.wins}</div>}
        />
        <TeamStatsCard
          title={strings.th_losses}
          subheader={
            <div className="textDanger">{generalData.data.losses}</div>
          }
        />
        <TeamStatsCard
          title={strings.th_rating}
          subheader={Math.floor(generalData.data.rating)}
        />
      </Row>
      {/* <Row>
        {config.VITE_ENABLE_RIVALRY && (
          <Button
            label={formatTemplateToString(
              strings.app_rivalry_team,
              generalData.data.name,
            )}
            icon={
              <img
                src="/assets/images/rivalry-icon.png"
                alt="Sponsor logo for Rivalry.com"
                height="24px"
              />
            }
            href="https://rivalry.com/opendota"
            target="_blank"
            rel="noopener noreferrer"
          />
        )}
      </Row> */}
    </Column>
  </HeaderContainer>
);
