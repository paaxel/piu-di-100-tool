import { ChangeDetectionStrategy, Component } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { SeoService } from '../../../core/services/seo';
import { MaskInputIssue, SubnetAnalysis, analyzeCidr, analyzeIpAndMask, explainMaskInputIssue } from '../../../packages/toolkit/subnet-utils';

type SubnetToolMode = 'cidr' | 'ip-mask';

interface DisplayItem {
  labelKey: string;
  value: string;
}

const MODE_CONFIG: Record<SubnetToolMode, {
  title: string;
  description: string;
  i18nPrefix: string;
  defaults: { cidr: string; ip: string; mask: string };
}> = {
  cidr: {
    title: 'CIDR / Subnet Calculator',
    description: 'Analyze a CIDR block and instantly calculate subnet mask, network address, broadcast address and available IP addresses.',
    i18nPrefix: 'TOOLS.SUBNET_CIDR',
    defaults: {
      cidr: '192.168.1.42/24',
      ip: '192.168.1.42',
      mask: '255.255.255.0',
    },
  },
  'ip-mask': {
    title: 'IP + Subnet Mask Calculator',
    description: 'Enter an IP address plus subnet mask or prefix length to calculate the network, broadcast and how many IP addresses are available.',
    i18nPrefix: 'TOOLS.SUBNET_IP_MASK',
    defaults: {
      cidr: '192.168.1.42/24',
      ip: '192.168.1.42',
      mask: '255.255.255.0',
    },
  },
};

@Component({
  selector: 'app-subnet-tool',
  standalone: false,
  templateUrl: './subnet-tool.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SubnetTool {
  readonly form: FormGroup;
  readonly mode: SubnetToolMode;
  readonly i18nPrefix: string;
  result: SubnetAnalysis | null = null;
  errorKey = '';
  errorParams: Record<string, string> = {};
  errorDetailKey = '';
  errorDetailParams: Record<string, string> = {};

  private readonly numberFormatter = new Intl.NumberFormat();

  constructor(fb: FormBuilder, route: ActivatedRoute, seo: SeoService) {
    this.mode = (route.snapshot.data['mode'] as SubnetToolMode) ?? 'cidr';
    const config = MODE_CONFIG[this.mode];
    this.i18nPrefix = config.i18nPrefix;
    seo.set(config.title, config.description);

    this.form = fb.group({
      cidr: [config.defaults.cidr],
      ip: [config.defaults.ip],
      mask: [config.defaults.mask],
    });

    this.form.valueChanges.subscribe(() => this.calculate());
    this.calculate();
  }

  get primaryItems(): DisplayItem[] {
    if (!this.result) return [];

    return [
      { labelKey: 'TOOLS.SUBNET.PREFIX', value: `/${this.result.prefixLength}` },
      { labelKey: 'TOOLS.SUBNET.SUBNET_MASK', value: this.result.subnetMask },
      { labelKey: 'TOOLS.SUBNET.TOTAL_ADDRESSES', value: this.numberFormatter.format(this.result.totalAddresses) },
      { labelKey: 'TOOLS.SUBNET.USABLE_HOSTS', value: this.numberFormatter.format(this.result.usableHosts) },
    ];
  }

  get detailItems(): DisplayItem[] {
    if (!this.result) return [];

    return [
      { labelKey: 'TOOLS.SUBNET.IP_ADDRESS', value: this.result.ipAddress },
      { labelKey: 'TOOLS.SUBNET.NETWORK_ADDRESS', value: this.result.networkAddress },
      { labelKey: 'TOOLS.SUBNET.BROADCAST_ADDRESS', value: this.result.broadcastAddress },
      { labelKey: 'TOOLS.SUBNET.FIRST_HOST', value: this.result.firstHost },
      { labelKey: 'TOOLS.SUBNET.LAST_HOST', value: this.result.lastHost },
      { labelKey: 'TOOLS.SUBNET.WILDCARD_MASK', value: this.result.wildcardMask },
    ];
  }

  calculate(): void {
    if (this.mode === 'cidr') {
      const cidr = (this.form.value.cidr ?? '').trim();
      if (!cidr) {
        this.result = null;
        this.clearError();
        return;
      }

      this.result = analyzeCidr(cidr);
      if (this.result) {
        this.clearError();
      } else {
        this.errorKey = 'TOOLS.SUBNET_CIDR.ERROR';
      }
      return;
    }

    const ip = (this.form.value.ip ?? '').trim();
    const mask = (this.form.value.mask ?? '').trim();
    if (!ip && !mask) {
      this.result = null;
      this.clearError();
      return;
    }

    this.result = analyzeIpAndMask(ip, mask);
    if (this.result) {
      this.clearError();
      return;
    }

    this.errorKey = 'TOOLS.SUBNET_IP_MASK.ERROR';
    this.setMaskExplanation(explainMaskInputIssue(mask));
  }

  reset(): void {
    const defaults = MODE_CONFIG[this.mode].defaults;
    this.form.reset(defaults);
    this.clearError();
    this.result = this.mode === 'cidr'
      ? analyzeCidr(defaults.cidr)
      : analyzeIpAndMask(defaults.ip, defaults.mask);
  }

  private clearError(): void {
    this.errorKey = '';
    this.errorParams = {};
    this.errorDetailKey = '';
    this.errorDetailParams = {};
  }

  private setMaskExplanation(issue: MaskInputIssue | null): void {
    if (!issue) {
      this.errorDetailKey = '';
      this.errorDetailParams = {};
      return;
    }

    switch (issue.code) {
      case 'invalid-prefix':
        this.errorDetailKey = 'TOOLS.SUBNET_IP_MASK.ERROR_DETAIL_INVALID_PREFIX';
        this.errorDetailParams = { value: issue.value };
        return;
      case 'invalid-format':
        this.errorDetailKey = 'TOOLS.SUBNET_IP_MASK.ERROR_DETAIL_INVALID_FORMAT';
        this.errorDetailParams = { value: issue.value };
        return;
      case 'invalid-octet':
        this.errorDetailKey = 'TOOLS.SUBNET_IP_MASK.ERROR_DETAIL_INVALID_OCTET';
        this.errorDetailParams = {
          value: issue.value,
          octet: issue.invalidOctet ?? '',
          binary: issue.binaryOctet ?? '',
        };
        return;
      case 'non-contiguous':
        this.errorDetailKey = 'TOOLS.SUBNET_IP_MASK.ERROR_DETAIL_NON_CONTIGUOUS';
        this.errorDetailParams = { value: issue.value };
        return;
    }
  }
}