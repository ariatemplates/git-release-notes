export = gitReleaseNotes;

interface ICommit {
	sha1: string;
	authorName: string;
	authorEmail: string;
	authorDate: string;
	committerName: string;
	committerEmail: string;
	committerDate: string;
	title: string;
	tag: string;
	messageLines: string[];
}
type postprocessingFn = (data: {
	commits: ICommit[];
	range: string;
	dateFnsFormat: (data: string | number | Date, format?: string, options?: {
		locale?: any;
	}) => string;
	debug: any;
}, callback: (data: any) => void) => void;

declare function gitReleaseNotes(options: {
	p?: string;
	path?: string;
	b?: string;
	branch?: string;
	i?: string;
	"ignore-case"?: string;
	s?: postprocessingFn | string;
	script?: postprocessingFn | string;
	t?: string;
	title?: string;
	f?: string;
	file?: string;
	c?: boolean;
	"merge-commits"?: boolean;
	o?: string[] | string;
	"gitlog-option"?: string[] | string;
	m?: string[] | string;
	meaning?: string[] | string;
}, range: string, template: string): Promise<string>

declare namespace gitReleaseNotes {

}
