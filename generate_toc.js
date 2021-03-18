/* ************************************************************************** */
/*                                                                            */
/*                                                        :::      ::::::::   */
/*   generate_toc.js                                    :+:      :+:    :+:   */
/*                                                    +:+ +:+         +:+     */
/*   By: jleem <jleem@student.42seoul.kr>           +#+  +:+       +#+        */
/*                                                +#+#+#+#+#+   +#+           */
/*   Created: 2021/03/11 05:44:00 by jleem             #+#    #+#             */
/*   Updated: 2021/03/18 23:21:13 by jleem            ###   ########.fr       */
/*                                                                            */
/* ************************************************************************** */

'use strict'

const fs = require('fs-extra')
const path = require('path')
const chalk = require('chalk')

async function getFiles(dir)
{
	const subdirs = await fs.readdir(dir)
	const files = await Promise.all(subdirs.map(async (subdir) =>
	{
		const res = path.resolve(dir, subdir)
		return ((await fs.stat(res)).isDirectory() ? getFiles(res) : res)
	}))

	return (files.reduce((a, f) => a.concat(f), []))
}

async function extractHeading(filename, idx)
{
	try
	{
		const text = await (await fs.readFile(filename)).toString()
		const heading = (idx) => `> # ${idx}`
		const regex_pattern = new RegExp(`(?:${heading(idx)}[^\\n]*)([\\s|\\S]*?)(?:${heading(idx + 1)})`)
		const text_extracted =
			text.match(regex_pattern)[1]
				.trim()
				.replace(/<br \/>$/, '')
				.trim()
		return (text_extracted)
	}
	catch (e)
	{
		console.log(e)
	}
}

!async function main()
{
	const files = await getFiles('wiki')
	const markdowns = files.filter(
		filename => (path.extname(filename) == '.md') && (/\d{8}/.test(filename))
	)

	const markdowns_parsed = await Promise.all(markdowns.map(async filename =>
	{
		return {
			filename,
			date: await extractHeading(filename, 1),
			topic: await extractHeading(filename, 3),
			goal: await extractHeading(filename, 5)
		}
	}))

	markdowns_parsed.sort((a, b) => (a.filename > b.filename ? 1 : -1))

	markdowns_parsed.forEach(md =>
	{
		console.log(chalk.cyan(md.date))
		console.log('\n')
		console.log(md.topic)
		console.log('\n')
		console.log(md.goal)
		console.log(chalk.green('-'.repeat(process.stdout.columns)))
	})
}()
