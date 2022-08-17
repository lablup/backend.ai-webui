const child_process = require('child_process')
const fs = require('fs')
const { Octokit } = require("octokit")
const path = require('path')

/**
 * Environment variables
 * GITHUB_TOKEN (Required): Github authentication token
 * REPOSITORY: Target repository to upload release asset. defaults to lablup/backend.ai-webui
 * RELEASE_TAG: Release tag, defaults to latest tag
 */

const [OWNER, REPOSITORY] = (process.env.REPOSITORY || 'lablup/backend.ai-webui').split('/')
const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN })

const execCommand = async (command, ...args) => {
    return await new Promise((res, rej) => {
        const proc = child_process.spawn(command, args)
        let stdout = ''
        let stderr = ''
        proc.stdout.on('data', (d) => {
            stdout += d.toString()
        })
        proc.stderr.on('data', (d) => {
            stderr += d.toString()
        })
        proc.on('close', (code) => {
            if (code === 0) res([stdout, stderr])
            else rej([stdout, stderr])
        })
    })
}
const getLatestTag = async () => {
    const [stdout, _] = await execCommand('/usr/bin/env', 'git', 'describe', '--tags', '--abbrev=0')
    return stdout.trim()
}

const getReleaseIdFromTag = async (tag) => {
    const { data: { id } } = await octokit.rest.repos.getReleaseByTag({ owner: OWNER, repo: REPOSITORY, tag })
    return id
}

const getUploadURL = async (releaseId) => {
    const { data: { upload_url } } = await octokit.rest.repos.getRelease({ owner: OWNER, repo: REPOSITORY, release_id: releaseId })
    return upload_url
}

const main = async () => {
    if (process.argv.length !== 3) {
        console.error('usage: node upload-release.js <folder containing DMG files>')
        process.exit(1)
    }
    const folder = process.argv[2]
    let DMGs = []
    try {
        DMGs = (await fs.promises.readdir(folder)).filter((s) => !s.startsWith('.') && s.endsWith('.dmg'))
    } catch (e) {
        console.error(e.message)
        process.exit(1)
    }
    
    console.log(`found ${DMGs.length} DMG(s): ${DMGs}`)

    const tag = process.env.RELEASE_TAG || (await getLatestTag())
    const releaseId = await getReleaseIdFromTag(tag)
    
    for (const filename of DMGs) {
        console.log(`Uploading file ${filename} to https://github.com/${OWNER}/${REPOSITORY}/releases/${tag}`)
        const uploadUrl = await getUploadURL(releaseId)
        const buf = await fs.promises.readFile(path.join(folder, filename))
        try {
            await octokit.request({
                method: 'POST',
                url: uploadUrl,
                headers: {
                    'content-type': 'application/octet-stream',
                },
                data: buf,
                name: filename,
            })
            console.log('completed uploading file')
        } catch (e) {
            if (e.response.data) {
                console.error('error while uploading file:', e.response.data.errors)
            } else {
                console.error('unknown error while uploading file:')
                console.error(e)
            }
        }
    }
}

main()
.catch((e) => {
    console.error(e)
    process.exit(1)
})