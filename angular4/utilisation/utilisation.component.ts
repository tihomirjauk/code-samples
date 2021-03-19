import { Component, OnInit } from '@angular/core';
import { StoreService } from '@app/services/app.service';
import { PeopleStatisticsService } from '@app/services/people.statistics.service';
import { ConfigService } from '@app/services/config.service';
import { SvAnalyticsService } from '@app/services/sv-analytics.service';
import { KeymetricsService } from '@app/services/keymetrics.service';
import { precisionRound } from '@app/services/math.service';

@Component({
  selector: 'pd-utilisation',
  templateUrl: './utilisation.component.html',
  styleUrls: ['./utilisation.component.scss']
})
export class UtilisationComponent implements OnInit {

  config = {
    panel: true,
    last_number_of_months: 3,
    change_over_months: 6,
  };

  utilisation_tabs = 'unique';
  labels = {
    average: 'Average Peak People',
    peak: 'Peak People',
    unique: 'Unique People',
  };

  private configuredTargetUtilisationPercentage = 100;

  constructor(
    public store: StoreService,
    private peopleStatisticsService: PeopleStatisticsService,
    private configService: ConfigService,
    private mixpanelService: SvAnalyticsService,
    private keymetricsService: KeymetricsService
  ) { }

  ngOnInit() {
    this.configService.config.subscribe(
      (c) => this.configuredTargetUtilisationPercentage = c.targetUtilisationPercentage
    );
  }

  get targetUtilisationPercentage(): number {
    if (this.store.orgUnitSelected() || this.store.teamSelected()) {
      return 100;
    }
    return this.configuredTargetUtilisationPercentage;
  }
  // Target utilisation percentage. Use this value in calculation instead of (this.targetUtilisationPercentage / 100)
  get targetUtilisationPercentageMultiplier(): number {
    return (this.targetUtilisationPercentage / 100);
  }

  // stats boxes
  get totalWorkpoints(): number {
    return this.keymetricsService.totalWorkpoints;
  }

  /*
  Utilization: Calculated as : Real People / Total Workpoints  (x100 for %)
  */
  get utilisation(): number {
    /*
    let value = 85;
    */
    let value = 0;
    if (this.totalWorkpoints > 0) {
      value = Math.round(this.realPeople / this.totalWorkpoints * 100);
    }
    this.configService.setUtilisationColor(value);
    return value;
  }

  /*
  Optimal Utilization (previously called Target Utilisation)
  */
  get optimalUtilisation(): number {
    if (this.totalWorkpoints > 0) {
      return Math.round(this.realPeople / this.totalWorkpoints * 100) / 100;
    }
    return 0;
  }

  /*
  Minimum Unoccupied : This used to be called "Peak Opportunity."
  It was decided that this term was confusing, so it was changed.
  It is calculated : Total Workpoints - Real People
  Updated later to Free Desks
  Updated to Desks Over in case of negative number
  */
  get freeDesks(): number {
    const freeDesks = ((this.totalWorkpoints * this.targetUtilisationPercentageMultiplier) - this.realPeople) || 0;
    this.store.setFreeDesks(Math.round(freeDesks));
    return freeDesks;
  }

  /*
  Real Opportunity : The number of additional people that could be assigned to that space, analogue for Opportunity
  */
  get realOpportunity(): number {
    return this.realCapacity - (this.keymetricsService.totalPeople + this.keymetricsService.retainedOccupiedDesks);
  }

  get peopleLabel(): string {
    if (this.labels[this.utilisation_tabs]) {
      return this.labels[this.utilisation_tabs];
    }
    return 'People';
  }

  get peakPeople(): number {
    return this.peopleStatisticsService.peakPeople;
  }

  get averagePeakPeople(): number {
    return this.peopleStatisticsService.averagePeakPeople;
  }

  get uniquePeople(): number {
    return this.peopleStatisticsService.uniquePeople;
  }

  // Real People (definition) = Peak People, Avg Peak People, Unique People etc.
  get realPeople(): number {
    if (this.utilisation_tabs === 'average') {
      return this.averagePeakPeople;
    }
    if (this.utilisation_tabs === 'unique') {
      return this.uniquePeople;
    }
    // 'peak'
    return this.peakPeople;
  }

  /*
  Utilization: As a '3' month trend up or down and the associated percentage change.
  */
  get utilisationTrend(): number {
    return this.peopleStatisticsService.utilisationTrend;
  }

  get utilisationTrendIcon(): string {
    if (this.utilisationTrend < 0) {
      return 'glyphicon glyphicon-triangle-bottom';
    }
    return 'glyphicon glyphicon-triangle-top';
  }

  /*
  Real Ratio  :  The ratio the team is actually operating on, based on the Show Up %, comparable to Target ratio)
  */
  get realRatio(): number {
    return (
      (this.keymetricsService.totalPeople +
        this.keymetricsService.retainedOccupiedDesks) / this.realPeople) *
      this.targetUtilisationPercentageMultiplier;
  }

  /*
  Capacity
  No filters selected: Show total capacity for the portfolio
  Org Unit only selected:
  Location only selected: Show total capacity for the location
  Org Unit and Location selected:
  Team Selected:
  */
  get realCapacity(): number {
    return this.realRatio * this.totalWorkpoints;
  }

  get localizedUtilisation(): string {
    if (this.configService.locale === 'en-us') {
      return 'Utilization';
    } else {
      return 'Utilisation';
    }
  }

  get localizedUtilized(): string {
    if (this.configService.locale === 'en-us') {
      return 'utilized';
    } else {
      return 'utilised';
    }
  }

  get localizedMaximise(): string {
    if (this.configService.locale === 'en-us') {
      return 'maximize';
    } else {
      return 'maximise';
    }
  }

  get utilisationColor(): string {
    if (this.store.getSelectedTeam()) {
      return this.configService.colors.blue;
    }
    return this.configService.getUtilisationColor();
  }

  get sublabel(): string {
    return this.configService.getSublabel(this.utilisation);
  }

  get utilisationTrendPeriodInMonths(): number {
    return this.configService.utilisationTrendPeriodInMonths;
  }

  get utilisationPeriodInMonths(): number {
    return this.configService.utilisationPeriodInMonths;
  }

  utilisationTypeChanged() {
    this.mixpanelService.Track('Portfolio Dashboards - Utilisation Type Changed', { NewType: this.utilisation_tabs });
  }

  // *** TOOLTIPS ***
  showTooltipFor(key) {
    const tips = {
      people: {
        unique: 'The maximum number of unique people seen on one day, within this time period.',
        peak: 'The maximum number of people seen at once, in this time period (Peak People).',
        average: 'The daily Peak People, averaged across the time period (Average People).',
      },
      utilisation: {
        unique: 'The maximum number of workpoints ' + this.localizedUtilized + ' based on Unique People as a percentage.',
        peak: 'The maximum number of workpoints ' + this.localizedUtilized + ' based on Peak People as a percentage.',
        average: 'The maximum number of workpoints ' + this.localizedUtilized + ' based on Average People as a percentage.',
      },
      freeDesks: {
        unique: 'The minimun number of desks that were free.<br>Free Desks (' + Math.round(this.freeDesks)
        + ') is the number of Threshold utilised Workpoints (' + precisionRound(this.totalWorkpoints * this.targetUtilisationPercentageMultiplier, 2)
        + ') minus Unique people (' + this.realPeople + ').',
        peak: 'The minimun number of desks that were free.<br>Free Desks ('
        + Math.round(this.freeDesks) + ') is the number of Threshold utilised Workpoints ('
        + precisionRound(this.totalWorkpoints * this.targetUtilisationPercentageMultiplier, 2) + ') minus Peak people (' + this.peakPeople + ').',
        average: 'The minimun number of desks that were free.<br>Free Desks ('
        + Math.round(this.freeDesks) + ') is the number of Threshold utilised Workpoints ('
        + precisionRound(this.totalWorkpoints * this.targetUtilisationPercentageMultiplier, 2) + ') minus Average people (' + precisionRound(this.averagePeakPeople, 2) + ').',
      },
      deskOver: {
        unique: 'The maximum number of workpoints ' + this.localizedUtilized + ' over the ' + this.localizedUtilisation + ' Threshold.'
                + '  Desks Over (' + Math.abs(Math.round(this.freeDesks)) + ')  is Unique People (' + this.uniquePeople + ') minus Threshold ' + this.localizedUtilized + ' Workpoints (' + precisionRound(this.totalWorkpoints * this.targetUtilisationPercentageMultiplier, 2) + ').',
        peak: 'The maximum number of workpoints ' + this.localizedUtilized + ' over the ' + this.localizedUtilisation + ' Threshold.'
                + '  Desks Over (' + Math.abs(Math.round(this.freeDesks)) + ')  is Peak People (' + this.peakPeople + ') minus Threshold ' + this.localizedUtilized + ' Workpoints (' + precisionRound(this.totalWorkpoints * this.targetUtilisationPercentageMultiplier, 2) + ').',
        average: 'The maximum number of workpoints ' + this.localizedUtilized + ' over the ' + this.localizedUtilisation + ' Threshold.'
                + '  Desks Over (' + Math.abs(Math.round(this.freeDesks)) + ')  is Average People (' + precisionRound(this.averagePeakPeople, 2) + ') minus Threshold ' + this.localizedUtilized + ' Workpoints (' + precisionRound(this.totalWorkpoints * this.targetUtilisationPercentageMultiplier, 2) + ').',
      },
      morePeople: 'The amount of people that can be assigned to attain ' + this.localizedUtilisation
      + ' Threshold (' + this.targetUtilisationPercentage + '%). ',
      peopleOver: {
        unique : 'The amount of people that can be assigned elsewhere to attain ' + this.localizedUtilisation + ' Threshold (' + precisionRound(this.targetUtilisationPercentage, 2) + '%).',
        peak: 'The amount of people that can be assigned elsewhere to attain ' + this.localizedUtilisation + ' Threshold (' + precisionRound(this.targetUtilisationPercentage, 2) + '%).',
        average: 'The amount of people that can be assigned elsewhere to attain ' + this.localizedUtilisation + ' Threshold (' + precisionRound(this.targetUtilisationPercentage, 2) + '%).',
      },
      realRatio: {
        unique: 'Ratio (' + precisionRound(this.realRatio, 2) + ') is the ratio of Assigned People ('
        + (this.keymetricsService.totalPeople + this.keymetricsService.retainedOccupiedDesks)
        + ') to Unique People (' + this.realPeople + ') multiplied by the '
        + this.localizedUtilisation + ' Threshold (' + this.targetUtilisationPercentage + '%).',
        peak: 'Ratio (' + precisionRound(this.realRatio, 2) + ') is the ratio of Assigned People ('
        + (this.keymetricsService.totalPeople + this.keymetricsService.retainedOccupiedDesks)
        + ') to Peak People (' + this.realPeople + ') multiplied by the '
        + this.localizedUtilisation + ' Threshold (' + this.targetUtilisationPercentage + '%).',
        average: 'Ratio (' + precisionRound(this.realRatio, 2) + ') is the ratio of Assigned People ('
        + (this.keymetricsService.totalPeople + this.keymetricsService.retainedOccupiedDesks)
        + ') to Average People (' + precisionRound(this.realPeople, 2) + ') multiplied by the '
        + this.localizedUtilisation + ' Threshold (' + this.targetUtilisationPercentage + '%).',
      },
      realCapacity : 'Capacity (' + Math.round(this.realCapacity)  + ') is the Total Workpoints (' + this.totalWorkpoints +
        ') multiplied by the Ratio (' +  precisionRound(this.realRatio, 2) + ').'
    };

    if (tips[key]) {
      if (tips[key][this.utilisation_tabs]) {
        return tips[key][this.utilisation_tabs];
      } else {
        return tips[key];
      }
    }

    return '';
  }

}
