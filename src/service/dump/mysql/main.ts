import { DatabaseType } from '@/common/constants';
import { Node } from '@/model/interface/node';
import { all as merge } from 'deepmerge';
import * as fs from 'fs';
import { getDataDump } from './getDataDump';
import { getFunctionDump } from './getFunctionDump';
import { getProcedureDump } from './getProcedureDump';
import { getTableDump } from './getTableDump';
import { getTriggerDump } from './getTriggerDump';
import { getViewDump } from './getViewDump';
import { HEADER_VARIABLES, FOOTER_VARIABLES } from './sessionVariables';
import {
    CompletedOptions, Options
} from './interfaces/Options';

export {
    Options
};

const defaultOptions: Options = {
    dump: {
        tables: [],
        schema: {
            engine: true,
            table: {
                ifNotExist: false,
                dropIfExist: true
            },
            view: {
                createOrReplace: true,
                algorithm: false,
                definer: false,
                sqlSecurity: false,
            },
        },
        data: {
            lockTables: false,
            where: {},
            maxRowsPerInsertStatement: 5000,
        },
        trigger: {
            dropIfExist: true,
            definer: false,
        },
    },
    dumpToFile: null,
};

function isMysql(node: Node) {
    return node.dbType != DatabaseType.PG && node.dbType != DatabaseType.MSSQL;
}


export default async function main(inputOptions: Options, node: Node): Promise<void> {

    const options = merge([defaultOptions, inputOptions]) as CompletedOptions;

    // write to the destination file (clear it)
    fs.writeFileSync(options.dumpToFile, '');

    // write the initial headers
    if (isMysql(node)) {
        fs.appendFileSync(options.dumpToFile, `${HEADER_VARIABLES}\n`);
    }

    if (node.schema && options.dump.withDatabase && isMysql(node)) {
        fs.appendFileSync(options.dumpToFile, `CREATE DATABASE /*!32312 IF NOT EXISTS*/ ${node.schema} /*!40100 DEFAULT CHARACTER SET utf8mb4 */;
USE ${node.schema};\n\n`);
    }

    const sessionId = new Date().getTime() + ""

    // dump the schema if requested
    if (options.dump.schema !== false) {
        const tableDatas = await getTableDump(node, sessionId, options.dump.schema, options.dump.tables)
        fs.appendFileSync(options.dumpToFile, `${tableDatas}\n\n`);
    }

    if (options.dump.schema !== false) {
        const viewDatas = await getViewDump(node, sessionId, options.dump.schema, options.dump.viewList);
        fs.appendFileSync(options.dumpToFile, `${viewDatas}\n\n`);
    }

    if (options.dump.data !== false) {
        await getDataDump(node, sessionId, options.dump.data, options.dump.tables, options.dumpToFile,);
    }

    if (options.dump.procedure !== false) {
        const predecureDatas = await getProcedureDump(node, sessionId, options.dump.procedure, options.dump.procedureList);
        fs.appendFileSync(options.dumpToFile, `${predecureDatas}\n\n`);
    }

    if (options.dump.procedure !== false) {
        const functionDatas = await getFunctionDump(node, sessionId, options.dump.function, options.dump.functionList);
        fs.appendFileSync(options.dumpToFile, `${functionDatas}\n\n`);
    }

    if (options.dump.trigger !== false) {
        const triggerDatas = await getTriggerDump(node, sessionId, options.dump.trigger, options.dump.triggerList);
        fs.appendFileSync(options.dumpToFile, `${triggerDatas}\n\n`);
    }

      // reset all of the variables
      if (isMysql(node)) {
        fs.appendFileSync(options.dumpToFile, FOOTER_VARIABLES);
    }

}

// a hacky way to make the package work with both require and ES modules
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(main as any).default = main;
