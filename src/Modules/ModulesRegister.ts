import { Client, Message, MessageTypes } from '@open-wa/wa-automate';
import Zaplify from './Zaplify';

export interface Args {
	immediate?: string;
}

type PublicMethod = {
	name: string;
	method: (args: Args) => any;
};
type ModuleAddresser = {
	name: string;
	module: Module;
};

export class Module {
	publicMethods: PublicMethod[];
	zaplify: Zaplify | null;
	requester: Message | unknown;

	constructor() {
		this.publicMethods = [];
		this.zaplify = null;
		this.requester = null;
	}

	callMethod(methodName: string, args: Args): any {
		const choosenMethod = this.publicMethods.filter(
			method => method.name === methodName
		)[0];
		if (!choosenMethod) {
			if (methodName !== 'default') {
				return this.callMethod('default', args);
			} else {
				return;
			}
		}
		return choosenMethod.method(args);
	}

	registerPublicMethod(method: PublicMethod) {
		this.publicMethods.push(method);
	}

	setRequester() {
		const message = this.zaplify?.messageObject;
		if (message?.type && message?.type !== MessageTypes.BUTTONS_RESPONSE) {
			this.requester = message;
		}
	}
}

class ModulesWrapper {
	modules: ModuleAddresser[];

	constructor() {
		this.modules = [];
	}

	registerModule(moduleName: string, module: Module) {
		this.modules.push({
			name: moduleName,
			module,
		});
	}

	getModule(moduleName: string) {
		const moduleAddress = this.modules.filter(module => module.name === moduleName);
		return moduleAddress[0]?.module;
	}

	registerZaplify(zaplify: Zaplify) {
		this.modules.forEach(module => {
			module.module.zaplify = zaplify;
		});
	}
}

export default ModulesWrapper;
